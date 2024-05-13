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
          Authorization: `Bearer CJHNvZ33MRIHAgGAQAAAARil0PcVIMzO2x8olK3KATIUi-CDp5zH8e9c-EYk6bS-aH8ZXkE6UAAgAEH_BwAAAACAAABgeMAkgAAAIAAAAAQAADgAAADAw_8BAQAAAIAHAAAAAAAQAgAAAAAAAAAAAAACAAi4AgAAAAAAAAAAAAAAAAAAAABAQhR2KM9ZHhSFWPbhK8nwpoL7-eeS3UoDbmExUgBaAGAA`,
          "Content-Type": "application/json",
        },
      }
    );
    const emails = response.data.results.map((email) => {
      return {
        id: parseInt(email.id),
        subject: email.subject,
        preview: email.content.widgets.preview_text.body.value,
        name: email.name,
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
const addEmail = async (req, res) => {
  const accessToken = tokenCache.get("accessToken");
  console.log(req.body)
  try {
    const response = await axios.post(
      `https://api.hubapi.com/marketing/v3/emails`,
      {
        "content":{
            "widgets": {
                "preview_text": {
                    "body": {
                        "value": req.body.properties.preview
                    }
                }
            }
        },
        "name": req.body.properties.name,
        "subject": req.body.properties.subject
    },
      {
        headers: {
          Authorization: `Bearer CJHNvZ33MRIHAgGAQAAAARil0PcVIMzO2x8olK3KATIUi-CDp5zH8e9c-EYk6bS-aH8ZXkE6UAAgAEH_BwAAAACAAABgeMAkgAAAIAAAAAQAADgAAADAw_8BAQAAAIAHAAAAAAAQAgAAAAAAAAAAAAACAAi4AgAAAAAAAAAAAAAAAAAAAABAQhR2KM9ZHhSFWPbhK8nwpoL7-eeS3UoDbmExUgBaAGAA`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
};

module.exports = {
  getEmails,
  addEmail,
};
