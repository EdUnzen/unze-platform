import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_PERSONAL_MILESTONE_PREFS,
  type PersonalMilestonePrefs,
} from "@/lib/notifications/personal-milestones";

type ProfileSettings = {
  personal_milestones?: Partial<PersonalMilestonePrefs>;
};

export async function getPersonalMilestonePrefs(
  userId: string,
): Promise<PersonalMilestonePrefs> {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_PERSONAL_MILESTONE_PREFS;

  const { data } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", userId)
    .maybeSingle();

  const settings = (data?.settings as ProfileSettings) ?? {};
  const stored = settings.personal_milestones ?? {};

  return {
    ownAwards: stored.ownAwards !== false,
    ownRoles: stored.ownRoles !== false,
  };
}

export async function isPersonalMilestoneEnabled(
  userId: string,
  kind: keyof PersonalMilestonePrefs,
): Promise<boolean> {
  const prefs = await getPersonalMilestonePrefs(userId);
  return prefs[kind];
}
