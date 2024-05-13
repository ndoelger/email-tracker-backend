const axios = require("axios");
const tokenCache = require("../cache");
const prisma = require("../prisma/prismaClient");

const getEmails = async (req, res) => {
  const accessToken = tokenCache.get("accessToken");
  try {
    const response = await axios.get(
      `https://api.hubapi.com/marketing/v3/emails`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const emails = response.data.results.map((email) => {
      console.log(email);
      return {
        id: parseInt(email.id),
        subject: email.subject,
        preview: email.content.widgets.preview_text.body.value,
        title: email.name,
      };
    });

    for (const email of emails) {
      await prisma.email.upsert({
        where: { id: email.id },
        update: email,
        create: email,
      });
    }

    res.json(emails);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
};

module.exports = {
  getEmails,
};
