type SendPasswordResetEmailParams = {
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail(params: SendPasswordResetEmailParams) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESET_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return {
      delivered: false as const,
      reason: "not_configured" as const
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      text: params.text
    })
  });

  if (!response.ok) {
    return {
      delivered: false as const,
      reason: "provider_error" as const
    };
  }

  return {
    delivered: true as const
  };
}

type LegacyPasswordResetEmailParams = {
  to: string;
  resetUrl: string;
  recipientName: string;
  salonName: string;
};

export async function sendPasswordResetEmail(params: LegacyPasswordResetEmailParams) {
  return sendTransactionalEmail({
    to: params.to,
    subject: `Wachtwoord reset voor ${params.salonName}`,
    text: [
      `Hoi ${params.recipientName},`,
      "",
      `Er is een verzoek gedaan om het wachtwoord voor je account bij ${params.salonName} opnieuw in te stellen.`,
      "Gebruik onderstaande link om een nieuw wachtwoord te kiezen:",
      params.resetUrl,
      "",
      "Deze link is 60 minuten geldig en kan maar één keer worden gebruikt.",
      "",
      "Heb je dit verzoek niet gedaan? Dan kun je deze e-mail negeren."
    ].join("\n")
  });
}
