'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Adjust the path as needed
import { useRouter } from 'next/navigation';

type Team = {
    id: string;
    team_name: string;
    owner_id: string;
};

type TeamAuthContextType = {
    team: Team | null;
    errorMessage: string | null;
    login: (teamName: string, password: string) => Promise<void>;
    logout: () => void;
};

const TeamAuthContext = createContext<TeamAuthContextType | undefined>(undefined);

export function TeamAuthProvider({ children }: { children: ReactNode }) {
    const [team, setTeam] = useState<Team | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedTeam = sessionStorage.getItem('team');
        if (storedTeam) {
            setTeam(JSON.parse(storedTeam));
        }
    }, []);

    const login = async (teamName: string, password: string) => {
        setErrorMessage(null);

        try {
            const { data: teams, error } = await supabase
                .from('teams')
                .select('id, team_name, owner_id')
                .eq('team_name', teamName)
                .eq('password', password);

            if (error) throw new Error(error.message);

            if (teams && teams.length > 0) {
                const team = teams[0];
                setTeam(team);
                sessionStorage.setItem('team', JSON.stringify(team));

                window.dispatchEvent(new Event('teamLoginStatusChange'));

                router.push('/teams/dashboard');
            } else {
                setErrorMessage('Invalid team name or password');
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unexpected error occurred during login.');
            }
        }
    };

    const logout = () => {
        setTeam(null);
        sessionStorage.removeItem('team');
        router.push('/teams');
    };

    return (
        <TeamAuthContext.Provider value={{ team, errorMessage, login, logout }}>
            {children}
        </TeamAuthContext.Provider>
    );
}

export function useTeamAuth() {
    const context = useContext(TeamAuthContext);
    if (!context) {
        throw new Error('useTeamAuth must be used within a TeamAuthProvider');
    }
    return context;
}
