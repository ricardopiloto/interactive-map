import { readFile } from "node:fs/promises";

export type LoggedEmail = { to: string; text: string; reply_to?: string | null };

export async function loggedEmails(): Promise<LoggedEmail[]> {
  try {
    const contents = await readFile(process.env.E2E_EMAIL_LOG_FILE!, "utf8");
    return contents
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LoggedEmail);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function latestEmail(to: string): Promise<LoggedEmail | undefined> {
  return (await loggedEmails()).filter((email) => email.to === to).at(-1);
}

export async function latestEmailMatching(
  to: string,
  pattern: RegExp,
): Promise<LoggedEmail | undefined> {
  return (await loggedEmails())
    .filter((email) => email.to === to && pattern.test(email.text))
    .at(-1);
}
