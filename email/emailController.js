const axios = require("axios");
const tokenCache = require("../util/cache");
const prisma = require("../prisma/prismaClient");
const { refreshAccessToken } = require("../user/userController");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const getEmails = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);
  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }
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

    const databaseEmails = await prisma.email
      .findMany({
        select: { id: true },
      })
      .then((emails) => emails.map((email) => email.id));

    const incomingEmailIds = emails.map((email) => email.id);

    const emailIdsToDelete = databaseEmails.filter(
      (id) => !incomingEmailIds.includes(id)
    );

    await prisma.email.deleteMany({
      where: { id: { in: emailIdsToDelete } },
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
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

const addEmail = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);
  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }
  try {
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
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

const deleteEmail = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);
  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }
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
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

const editEmail = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);
  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }
  try {
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
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

module.exports = {
  getEmails,
  addEmail,
  deleteEmail,
  editEmail,
};
