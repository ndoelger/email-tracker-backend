const axios = require("axios");
const tokenCache = require("../util/cache");
const prisma = require("../prisma/prismaClient");
const { refreshAccessToken } = require("../user/userController");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const ID_SECRET = process.env.ID_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// GET ALL EMAILS
const getEmails = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);

  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }
  try {
    const limit = req.query.limit || 10;

    const response = await axios.get(
      `https://api.hubapi.com/marketing/v3/emails?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const emails = response.data.results.map((email) => {
      return {
        email_id: parseInt(email.id),
        subject: email.subject,
        preview: email.content.widgets.preview_text.body.value,
        name: email.name,
      };
    });

    // REMOVE EMAILS THAT WERE REMOVED FROM HUBSPOT BUT NOT FROM THE APP
    const hubspotEmailIds = emails.map((email) => email.email_id);

    const localEmails = await prisma.email.findMany({
      select: { email_id: true },
    });

    const localEmailIds = localEmails.map((email) => email.email_id);

    const emailIdsToDelete = localEmailIds.filter(
      (id) => !hubspotEmailIds.includes(id)
    );
    await prisma.email.deleteMany({
      where: {
        email_id: { in: emailIdsToDelete },
      },
    });

    // ADD/UPDATE ALL EMAILS
    for (const email of emails) {
      await prisma.email.upsert({
        where: { email_id: email.email_id },
        update: {
          ...email,
          hub_id: tokenCache.get(ID_SECRET),
        },
        create: {
          ...email,
          hub_id: tokenCache.get(ID_SECRET),
        },
      });
    }
    res.json(emails);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// ADD AN EMAIL
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
          // "templatePath" PREVENTS THE EMAIL FROM BECOMING PREMIUM
          templatePath: "@hubspot/email/dnd/welcome.html",
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
      email_id: response.data.id,
    };

    // ADD EMAIL TO THE DATABASE WITH FOREIGN KEY (HUB_ID)
    await prisma.email.create({
      data: { ...emailData, hub_id: tokenCache.get(ID_SECRET) },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// DELETE AN EMAIL
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

    // DELETE FROM DATABASE
    await prisma.email.delete({
      where: {
        email_id: req.params.id,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// EDIT AN EMAIL
const editEmail = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);
  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }

  const currentEmail = await axios.get(
    `https://api.hubapi.com/marketing/v3/emails/${req.params.id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const currentEmailData = currentEmail.data;

  // USING HUBSPOT'S LEGACY API TO PREVENT CONTENT OVERWRITE
  try {
    const response = await axios.patch(
      `https://api.hubapi.com/marketing/v3/emails/${req.params.id}`,
      {
        ...currentEmailData,
        name: req.body.payload.name || currentEmailData.name,
        subject: req.body.payload.subject || currentEmailData.subject,
        content: {
          ...currentEmailData.content,
          widgets: {
            ...currentEmailData.content.widgets,
            preview_text: {
              body: {
                value:
                  req.body.payload.preview ||
                  currentEmailData.content.widgets.preview_text.body.value,
              },
            },
          },
        },
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
        email_id: req.params.id,
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
