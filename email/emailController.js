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
          Authorization: `Bearer CI6BrZ73MRIHAgGAQAAAARil0PcVIMzO2x8olK3KATIUsNBtg4xK37QU2QKE5TDXy02Rfw86UAAgAEH_BwAAAACAAABgeMAkgAAAIAAAAAQAADgAAADAw_8BAQAAAIAHAAAAAAAQAgAAAAAAAAAAAAACAAi4AgAAAAAAAAAAAAAAAAAAAABAQhRcRdTWfuGIDEEl5w-OuxHtQjwh9UoDbmExUgBaAGAA`,
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
  console.log(req.body);
  try {
    const response = await axios.post(
      `https://api.hubapi.com/marketing/v3/emails`,
      {
        content: {
          widgets: {
            preview_text: {
              body: {
                value: req.body.properties.preview,
              },
            },
          },
        },
        name: req.body.properties.name,
        subject: req.body.properties.subject,
      },
      {
        headers: {
          Authorization: `Bearer CI6BrZ73MRIHAgGAQAAAARil0PcVIMzO2x8olK3KATIUsNBtg4xK37QU2QKE5TDXy02Rfw86UAAgAEH_BwAAAACAAABgeMAkgAAAIAAAAAQAADgAAADAw_8BAQAAAIAHAAAAAAAQAgAAAAAAAAAAAAACAAi4AgAAAAAAAAAAAAAAAAAAAABAQhRcRdTWfuGIDEEl5w-OuxHtQjwh9UoDbmExUgBaAGAA`,
          "Content-Type": "application/json",
        },
      }
    );

    const emailData = {
      name: response.data.name,
      subject: response.data.subject,
      preview: response.data.preview,
      id: response.data.id,
    };

    console.log(response);

    prisma.email.create({});

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
