const axios = require("axios");
const tokenCache = require("../cache");

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
        id: email.id,
        subject: email.subject,
        preview: email.content.widgets.preview_text.body.value,
        email: email.name,
        // createdAt: dateCoverter(contact.createdAt),
      };
    });
    // if (response.data.paging) contacts.after = response.data.paging.next.after;
    res.json(emails);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
};

module.exports = {
  getEmails,
};
