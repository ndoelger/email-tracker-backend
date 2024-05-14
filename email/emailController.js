const axios = require("axios");
const tokenCache = require("../cache");
const prisma = require("../prisma/prismaClient");

const SECRET = process.env.SECRET;

const getEmails = async (req, res) => {
  const accessToken = tokenCache.get(SECRET);
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
  const accessToken = tokenCache.get(SECRET);
  try {
    console.log(req.body.payload.preview);
    const response = await axios.post(
      `https://api.hubapi.com/marketing/v3/emails`,
      {
        content: {
          widgets: {
            preview_text: {
              body: {
                value: req.body.payload.preview,
              },
            },
          },
        },
        name: req.body.payload.name,
        subject: req.body.payload.subject,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);

    const emailData = {
      name: response.data.name,
      subject: response.data.subject,
      preview: response.data.content.widgets.preview_text.body.value,
      id: response.data.id,
    };

    await prisma.email.create({
      data: emailData,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
};

const deleteEmail = async (req, res) => {
  const accessToken = tokenCache.get(SECRET);
  try {
    const response = await axios.delete(
      `https://api.hubapi.com/marketing/v3/emails/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    await prisma.email.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
};

const editEmail = async (req, res) => {
  const accessToken = tokenCache.get(SECRET);

  try {
    console.log(req.body.payload.preview);
    const response = await axios.patch(
      `https://api.hubapi.com/marketing/v3/emails/${req.params.id}`,
      {
        content: {
          widgets: {
            preview_text: {
              body: {
                value: req.body.payload.preview,
              },
            },
          },
        },
        name: req.body.payload.name,
        subject: req.body.payload.subject,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const emailData = {
      name: response.data.name,
      subject: response.data.subject,
      preview: response.data.content.widgets.preview_text.body.value,
    };

    await prisma.email.update({
      where: {
        id: req.params.id,
      },
      data: emailData,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
};

module.exports = {
  getEmails,
  addEmail,
  deleteEmail,
  editEmail,
};
