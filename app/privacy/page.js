import { SITE } from "@/lib/site";
import { Brand } from "@/components/Bits";

export const metadata = { title: "Privacy" };

// ✏️ Review this with your own details before launch. It is a starting point, not legal advice.
export default function Privacy() {
  return (
    <>
      <div className="wrap land-nav"><Brand /></div>
      <main className="wrap page">
        <article className="prose">
          <h1>Privacy</h1>
          <p className="small">Last updated October 2026</p>
          <p>{SITE.brand} is run by {SITE.tutorName} ({SITE.location}). This page explains what information the Road to 9 practice site keeps about students and parents, and why.</p>

          <h2>Who can have an account</h2>
          <p>Accounts are created by the tutor only. Students are invited after a parent or guardian has agreed. Parents get their own login to see their child's progress.</p>

          <h2>What we keep</h2>
          <ul>
            <li>Name (first name only) and email address, so you can log in.</li>
            <li>Exam board and tier, so practice matches your course.</li>
            <li>Practice activity: questions answered, right or wrong, XP, streaks and badges.</li>
            <li>Messages sent to Professor Prime and its replies.</li>
          </ul>
          <p>We don't ask for photos, phone numbers, addresses or school names, and students are asked not to share them.</p>

          <h2>Professor Prime, the AI tutor</h2>
          <p>Professor Prime is powered by Claude, an AI model made by Anthropic. When a student asks Prime for help, their message, their first name, exam board and the current question are sent to Anthropic to write a reply. Under its commercial terms, Anthropic does not use this data to train its models by default. The tutor can read Prime conversations to keep students safe and to see where they need help.</p>

          <h2>Who can see what</h2>
          <ul>
            <li>Students see their own progress.</li>
            <li>Parents see the progress of the children linked to their account.</li>
            <li>The tutor sees everything above, plus Prime conversations.</li>
          </ul>
          <p>We use Supabase to store data and Vercel to run the website. We never sell data or use it for advertising.</p>

          <h2>How long we keep it</h2>
          <p>We keep a student's data while they are being tutored. When tutoring ends, a parent can ask for the account and its data to be deleted, and we'll do it within 30 days.</p>

          <h2>Your rights</h2>
          <p>Parents and students can ask to see, correct or delete their data at any time. Contact {SITE.email} or WhatsApp {SITE.whatsapp}.</p>
        </article>
      </main>
    </>
  );
}
