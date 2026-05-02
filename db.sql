--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: buy_dice_secure(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.buy_dice_secure(amount integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_id UUID := auth.uid();
    total_cost INT := amount * 100; -- Harga dadu (100 koin)
    current_coins INT;
BEGIN
    -- Ambil saldo koin saat ini
    SELECT coins INTO current_coins FROM profiles WHERE id = user_id;

    -- Cek saldo
    IF current_coins < total_cost THEN
        RAISE EXCEPTION 'Koin tidak cukup!';
    END IF;

    -- Kurangi koin dan tambah dadu
    UPDATE profiles 
    SET coins = coins - total_cost, 
        dice_count = dice_count + amount 
    WHERE id = user_id;

    RETURN jsonb_build_object('success', true, 'new_dice_count', (SELECT dice_count FROM profiles WHERE id = user_id));
END;
$$;


--
-- Name: calculate_user_points(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_user_points(target_user_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    calculated_points INTEGER;
BEGIN
    -- Menghitung total poin berdasarkan tier dari tabel user_waifus dan waifu_pool
    SELECT COALESCE(SUM(
        CASE 
            WHEN wp.tier = 'C' THEN 30
            WHEN wp.tier = 'B' THEN 70
            WHEN wp.tier = 'A' THEN 150
            WHEN wp.tier = 'R' THEN 250
            WHEN wp.tier = 'S' THEN 400
            WHEN wp.tier = 'SR' THEN 600
            WHEN wp.tier = 'SSR' THEN 1000
            WHEN wp.tier = 'UR' THEN 2500
            WHEN wp.tier = 'LIMITED' THEN 7500
            ELSE 0
        END
    ), 0) INTO calculated_points
    FROM user_waifus uw
    JOIN waifu_pool wp ON uw.waifu_id = wp.id
    WHERE uw.user_id = target_user_id;

    -- Update kolom total_points di tabel profiles
    UPDATE profiles SET total_points = calculated_points WHERE id = target_user_id;
END;
$$;


--
-- Name: claim_daily_secure(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_daily_secure() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_id UUID := auth.uid();
    today DATE := CURRENT_DATE;
    last_claim DATE;
BEGIN
    -- Ambil tanggal klaim terakhir
    SELECT last_daily_claim INTO last_claim FROM profiles WHERE id = user_id;

    -- Cek apakah sudah klaim hari ini
    IF last_claim = today THEN
        RAISE EXCEPTION 'Anda sudah klaim hadiah hari ini!';
    END IF;

    -- Update dadu (+10) dan tanggal klaim
    UPDATE profiles 
    SET dice_count = dice_count + 10,
        last_daily_claim = today
    WHERE id = user_id;

    RETURN jsonb_build_object('success', true, 'message', '+10 Dadu Berhasil Diklaim!');
END;
$$;


--
-- Name: roll_gacha_secure(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.roll_gacha_secure(roll_count integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_id UUID := auth.uid();
    current_dice INT;
    results JSONB := '[]'::jsonb;
    rand_val FLOAT;
    picked_tier TEXT;
    picked_waifu RECORD;
    i INT;
BEGIN
    SELECT dice_count INTO current_dice FROM profiles WHERE id = user_id;
    IF current_dice < roll_count THEN RAISE EXCEPTION 'Dadu tidak cukup!'; END IF;

    FOR i IN 1..roll_count LOOP
        rand_val := RANDOM() * 100;
        
        -- Ambil tier berdasarkan kumulatif drop_chance dari tabel
        SELECT tier INTO picked_tier FROM (
            SELECT tier, SUM(drop_chance) OVER (ORDER BY 
                CASE tier 
                    WHEN 'LIMITED' THEN 1 WHEN 'UR' THEN 2 WHEN 'SSR' THEN 3 
                    WHEN 'SR' THEN 4 WHEN 'S' THEN 5 WHEN 'R' THEN 6 
                    WHEN 'A' THEN 7 WHEN 'B' THEN 8 WHEN 'C' THEN 9 
                END
            ) as cumulative_chance
            FROM tier_settings
        ) sub
        WHERE rand_val <= cumulative_chance
        LIMIT 1;

        -- Fallback jika ada error pembulatan
        IF picked_tier IS NULL THEN picked_tier := 'C'; END IF;

        SELECT * INTO picked_waifu FROM waifu_pool 
        WHERE tier = picked_tier ORDER BY RANDOM() LIMIT 1;

        IF picked_waifu.id IS NOT NULL THEN
            INSERT INTO user_waifus (user_id, waifu_id) VALUES (user_id, picked_waifu.id);
            results := results || to_jsonb(picked_waifu);
        END IF;
    END LOOP;

    UPDATE profiles SET dice_count = dice_count - roll_count WHERE id = user_id;
    RETURN results;
END;
$$;


--
-- Name: sell_waifus_secure(integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sell_waifus_secure(instance_ids integer[]) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    curr_user_id UUID := auth.uid();
    total_earned INT := 0;
BEGIN
    -- Hitung total harga berdasarkan join dengan tier_settings
    SELECT SUM(ts.sell_price) INTO total_earned
    FROM user_waifus uw
    JOIN waifu_pool wp ON uw.waifu_id = wp.id
    JOIN tier_settings ts ON wp.tier = ts.tier
    WHERE uw.id = ANY(instance_ids) AND uw.user_id = curr_user_id;

    IF total_earned IS NULL THEN
        RAISE EXCEPTION 'Waifu tidak ditemukan atau bukan milik Anda.';
    END IF;

    -- Hapus waifu
    DELETE FROM user_waifus WHERE id = ANY(instance_ids) AND user_id = curr_user_id;

    -- Tambah koin
    UPDATE profiles SET coins = coins + total_earned WHERE id = curr_user_id;

    RETURN jsonb_build_object('success', true, 'earned', total_earned);
END;
$$;


--
-- Name: trigger_update_points(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_update_points() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        PERFORM calculate_user_points(NEW.user_id);
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM calculate_user_points(OLD.user_id);
    END IF;
    RETURN NULL;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gacha_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gacha_history (
    id bigint NOT NULL,
    user_id uuid,
    waifu_id bigint,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: gacha_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.gacha_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.gacha_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    coins integer DEFAULT 0 NOT NULL,
    dice_count integer DEFAULT 0 NOT NULL,
    last_roll_timestamp bigint DEFAULT 0,
    last_daily_claim date,
    role text DEFAULT 'player'::text,
    total_points integer DEFAULT 0
);


--
-- Name: tier_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tier_settings (
    tier text NOT NULL,
    sell_price integer DEFAULT 10 NOT NULL,
    drop_chance double precision DEFAULT 0 NOT NULL
);


--
-- Name: user_waifus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_waifus (
    id bigint NOT NULL,
    user_id uuid,
    waifu_id bigint,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_waifus_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_waifus ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_waifus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: waifu_changelogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waifu_changelogs (
    id bigint NOT NULL,
    action text NOT NULL,
    waifu_name text NOT NULL,
    details text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: waifu_changelogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.waifu_changelogs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.waifu_changelogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: waifu_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waifu_pool (
    id bigint NOT NULL,
    jikan_id bigint NOT NULL,
    name text NOT NULL,
    image_url text NOT NULL,
    tier text NOT NULL
);


--
-- Name: waifu_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.waifu_pool ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.waifu_pool_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: waifu_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waifu_suggestions (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    waifu_name text NOT NULL,
    jikan_id bigint NOT NULL,
    image_url text NOT NULL,
    suggested_tier text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT waifu_suggestions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: waifu_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.waifu_suggestions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.waifu_suggestions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gacha_history gacha_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gacha_history
    ADD CONSTRAINT gacha_history_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: tier_settings tier_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tier_settings
    ADD CONSTRAINT tier_settings_pkey PRIMARY KEY (tier);


--
-- Name: user_waifus user_waifus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_waifus
    ADD CONSTRAINT user_waifus_pkey PRIMARY KEY (id);


--
-- Name: waifu_changelogs waifu_changelogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waifu_changelogs
    ADD CONSTRAINT waifu_changelogs_pkey PRIMARY KEY (id);


--
-- Name: waifu_pool waifu_pool_jikan_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waifu_pool
    ADD CONSTRAINT waifu_pool_jikan_id_key UNIQUE (jikan_id);


--
-- Name: waifu_pool waifu_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waifu_pool
    ADD CONSTRAINT waifu_pool_pkey PRIMARY KEY (id);


--
-- Name: waifu_suggestions waifu_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waifu_suggestions
    ADD CONSTRAINT waifu_suggestions_pkey PRIMARY KEY (id);


--
-- Name: user_waifus on_waifu_collection_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_waifu_collection_change AFTER INSERT OR DELETE ON public.user_waifus FOR EACH ROW EXECUTE FUNCTION public.trigger_update_points();


--
-- Name: gacha_history gacha_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gacha_history
    ADD CONSTRAINT gacha_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: gacha_history gacha_history_waifu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gacha_history
    ADD CONSTRAINT gacha_history_waifu_id_fkey FOREIGN KEY (waifu_id) REFERENCES public.waifu_pool(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_waifus user_waifus_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_waifus
    ADD CONSTRAINT user_waifus_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_waifus user_waifus_waifu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_waifus
    ADD CONSTRAINT user_waifus_waifu_id_fkey FOREIGN KEY (waifu_id) REFERENCES public.waifu_pool(id) ON DELETE CASCADE;


--
-- Name: waifu_suggestions waifu_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waifu_suggestions
    ADD CONSTRAINT waifu_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: waifu_changelogs Admins can insert changelogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert changelogs" ON public.waifu_changelogs FOR INSERT WITH CHECK (true);


--
-- Name: waifu_suggestions Admins can update status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update status" ON public.waifu_suggestions FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: waifu_pool Admins have full access on waifu_pool; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access on waifu_pool" ON public.waifu_pool USING ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::text));


--
-- Name: tier_settings Anyone can view tier settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view tier settings" ON public.tier_settings FOR SELECT USING (true);


--
-- Name: tier_settings Only admins can update tier settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update tier settings" ON public.tier_settings USING ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::text));


--
-- Name: waifu_changelogs Public can view changelogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view changelogs" ON public.waifu_changelogs FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: user_waifus User waifus are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User waifus are viewable by everyone" ON public.user_waifus FOR SELECT USING (true);


--
-- Name: user_waifus Users can delete own waifus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own waifus" ON public.user_waifus FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: waifu_suggestions Users can insert own suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own suggestions" ON public.waifu_suggestions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_waifus Users can insert own waifus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own waifus" ON public.user_waifus FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: waifu_pool Users can suggest waifus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can suggest waifus" ON public.waifu_pool FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK (((coins = ( SELECT profiles_1.coins
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid()))) AND (dice_count = ( SELECT profiles_1.dice_count
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))));


--
-- Name: waifu_suggestions Users can view own suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own suggestions" ON public.waifu_suggestions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: waifu_pool Waifus are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Waifus are viewable by everyone" ON public.waifu_pool FOR SELECT USING (true);


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tier_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tier_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_waifus; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_waifus ENABLE ROW LEVEL SECURITY;

--
-- Name: waifu_changelogs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waifu_changelogs ENABLE ROW LEVEL SECURITY;

--
-- Name: waifu_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waifu_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: waifu_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waifu_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION buy_dice_secure(amount integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.buy_dice_secure(amount integer) TO anon;
GRANT ALL ON FUNCTION public.buy_dice_secure(amount integer) TO authenticated;
GRANT ALL ON FUNCTION public.buy_dice_secure(amount integer) TO service_role;


--
-- Name: FUNCTION calculate_user_points(target_user_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.calculate_user_points(target_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.calculate_user_points(target_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_user_points(target_user_id uuid) TO service_role;


--
-- Name: FUNCTION claim_daily_secure(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.claim_daily_secure() TO anon;
GRANT ALL ON FUNCTION public.claim_daily_secure() TO authenticated;
GRANT ALL ON FUNCTION public.claim_daily_secure() TO service_role;


--
-- Name: FUNCTION roll_gacha_secure(roll_count integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.roll_gacha_secure(roll_count integer) TO anon;
GRANT ALL ON FUNCTION public.roll_gacha_secure(roll_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.roll_gacha_secure(roll_count integer) TO service_role;


--
-- Name: FUNCTION sell_waifus_secure(instance_ids integer[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.sell_waifus_secure(instance_ids integer[]) TO anon;
GRANT ALL ON FUNCTION public.sell_waifus_secure(instance_ids integer[]) TO authenticated;
GRANT ALL ON FUNCTION public.sell_waifus_secure(instance_ids integer[]) TO service_role;


--
-- Name: FUNCTION trigger_update_points(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.trigger_update_points() TO anon;
GRANT ALL ON FUNCTION public.trigger_update_points() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_update_points() TO service_role;


--
-- Name: TABLE gacha_history; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.gacha_history TO anon;
GRANT ALL ON TABLE public.gacha_history TO authenticated;
GRANT ALL ON TABLE public.gacha_history TO service_role;


--
-- Name: SEQUENCE gacha_history_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.gacha_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.gacha_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.gacha_history_id_seq TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE tier_settings; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.tier_settings TO anon;
GRANT ALL ON TABLE public.tier_settings TO authenticated;
GRANT ALL ON TABLE public.tier_settings TO service_role;


--
-- Name: TABLE user_waifus; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_waifus TO anon;
GRANT ALL ON TABLE public.user_waifus TO authenticated;
GRANT ALL ON TABLE public.user_waifus TO service_role;


--
-- Name: SEQUENCE user_waifus_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.user_waifus_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_waifus_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_waifus_id_seq TO service_role;


--
-- Name: TABLE waifu_changelogs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.waifu_changelogs TO anon;
GRANT ALL ON TABLE public.waifu_changelogs TO authenticated;
GRANT ALL ON TABLE public.waifu_changelogs TO service_role;


--
-- Name: SEQUENCE waifu_changelogs_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.waifu_changelogs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.waifu_changelogs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.waifu_changelogs_id_seq TO service_role;


--
-- Name: TABLE waifu_pool; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.waifu_pool TO anon;
GRANT ALL ON TABLE public.waifu_pool TO authenticated;
GRANT ALL ON TABLE public.waifu_pool TO service_role;


--
-- Name: SEQUENCE waifu_pool_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.waifu_pool_id_seq TO anon;
GRANT ALL ON SEQUENCE public.waifu_pool_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.waifu_pool_id_seq TO service_role;


--
-- Name: TABLE waifu_suggestions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.waifu_suggestions TO anon;
GRANT ALL ON TABLE public.waifu_suggestions TO authenticated;
GRANT ALL ON TABLE public.waifu_suggestions TO service_role;


--
-- Name: SEQUENCE waifu_suggestions_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.waifu_suggestions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.waifu_suggestions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.waifu_suggestions_id_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;

