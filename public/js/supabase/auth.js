import supabase from './supabaseClient';

export const signUp = async (email, password) => {
    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { user, error };
};

// ... other authentication related functions
