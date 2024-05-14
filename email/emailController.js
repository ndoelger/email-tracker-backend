const axios = require("axios");
const tokenCache = require("../util/cache");
const prisma = require("../prisma/prismaClient");
const { refreshAccessToken } = require("../user/userController");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const getEmails = async (req, res) => {
  const accessToken = tokenCache.get(ACCESS_SECRET);
  if (!accessToken) {
    return res.redirect(`${REDIRECT_URI}/refresh`);
  }
  console.log(req.query.limit);
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
        update: {
          ...email,
          user_id: tokenCache.get(REFRESH_SECRET),
        },
        create: {
          ...email,
          user_id: tokenCache.get(REFRESH_SECRET),
        },
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
          flexAreas: {
            main: {
              boxFirstElementIndex: null,
              boxLastElementIndex: null,
              boxed: false,
              isSingleColumnFullWidth: false,
              sections: [
                {
                  columns: [
                    {
                      id: "column-0-0",
                      widgets: ["module-0-0-0"],
                      width: 12,
                    },
                  ],
                  id: "section-0",
                  style: {
                    backgroundColor: "#eaf0f6",
                    backgroundType: "CONTENT",
                    paddingBottom: "10px",
                    paddingTop: "10px",
                    stack: "LEFT_TO_RIGHT",
                  },
                },
                {
                  columns: [
                    {
                      id: "column-1-0",
                      widgets: ["module-1-0-0"],
                      width: 12,
                    },
                  ],
                  id: "section-1",
                  style: {
                    backgroundType: "CONTENT",
                    paddingBottom: "30px",
                    paddingTop: "30px",
                    stack: "LEFT_TO_RIGHT",
                  },
                },
                {
                  columns: [
                    {
                      id: "column-2-0",
                      widgets: ["module-2-0-0"],
                      width: 12,
                    },
                  ],
                  id: "section-2",
                  style: {
                    backgroundColor: "",
                    backgroundType: "CONTENT",
                    paddingBottom: "20px",
                    paddingTop: "20px",
                    stack: "LEFT_TO_RIGHT",
                  },
                },
              ],
            },
          },
          styleSettings: {
            backgroundColor: "#EAF0F6",
            bodyBorderColor: "#EAF0F6",
            bodyBorderColorChoice: "BORDER_MANUAL",
            bodyBorderWidth: 1,
            bodyColor: "#ffffff",
            buttonStyleSettings: {
              backgroundColor: "#00a4bd",
              cornerRadius: 8,
              fontStyle: {
                bold: false,
                color: "#ffffff",
                font: "Arial, sans-serif",
                italic: false,
                size: 16,
                underline: false,
              },
            },
            dividerStyleSettings: {
              color: {
                color: "#23496d",
                opacity: 100,
              },
              height: 1,
              lineType: "solid",
            },
            headingOneFont: {
              size: 28,
            },
            headingTwoFont: {
              size: 22,
            },
            linksFont: {
              bold: false,
              color: "#00a4bd",
              italic: false,
              underline: true,
            },
            primaryFont: "Arial, sans-serif",
            primaryFontColor: "#23496d",
            primaryFontSize: 15,
            secondaryFont: "Arial, sans-serif",
            secondaryFontColor: "#23496d",
            secondaryFontSize: 12,
          },
          templatePath: "@hubspot/email/dnd/welcome.html",
          widgets: {
            "module-0-0-0": {
              body: {
                alignment: "center",
                css_class: "dnd-module",
                hs_enable_module_padding: true,
                img: {
                  alt: "HubSpot logo orange",
                  height: 72,
                  src: "https://static.hsappstatic.net/TemplateAssets/static-1.262/img/hs_default_template_images/email_dnd_template_images/company-logo-orange.png",
                  width: 240,
                },
                lineNumber: 37,
                parent_widget_container: null,
                path: "@hubspot/image_email",
                schema_version: 2,
                startPosition: -243,
              },
              child_css: {},
              css: {},
              id: "module-0-0-0",
              label: null,
              module_id: 1367093,
              name: "module-0-0-0",
              order: 1,
              smart_type: null,
              styles: {},
              type: "module",
            },
            "module-1-0-0": {
              body: {
                css_class: "dnd-module",
                html: '<p style="margin-bottom:10px;">Welcome friend, thank the reader for signing up to your newsletter and welcome them on board. Below your introduction, add a few links to some popular pages or posts on your website to give the reader an idea of what’s to come.<br></p><ol><li><strong>Showcase your best stories<br></strong>Give an overview of an existing blog post or a popular story from a previous newsletter. Be sure to add a <a target="_blank" href="">link</a> so the reader can learn more.<br><br></li><li><strong>Help people get to know you<br></strong>Share a link to your website’s <a target="_blank" href="">about us</a> page where the reader can learn more about you and your community.<br><br></li><li><strong>Keep the conversation going<br></strong>Tell your reader how they can get in touch if they have questions.</li></ol><p style="margin-bottom:10px;">Thanks,<br>The Your Company Name team</p>',
                i18nKey: "richText.welcome.primary",
                lineNumber: 47,
                parent_widget_container: null,
                path: "@hubspot/rich_text",
                schema_version: 2,
                startPosition: 19,
              },
              child_css: {},
              css: {},
              id: "module-1-0-0",
              label: null,
              module_id: 1155639,
              name: "module-1-0-0",
              order: 3,
              smart_type: null,
              styles: {},
              type: "module",
            },
            "module-2-0-0": {
              body: {
                align: "center",
                css_class: "dnd-module",
                font: {
                  color: "#23496d",
                  font: "Arial, sans-serif",
                  size: {
                    units: "px",
                    value: 12,
                  },
                },
                hs_enable_module_padding: false,
                lineNumber: 76,
                link_font: {
                  color: "#00a4bd",
                  font: "Helvetica,Arial,sans-serif",
                  size: {
                    units: "px",
                    value: 12,
                  },
                  styles: {
                    bold: false,
                    italic: false,
                    underline: true,
                  },
                },
                parent_widget_container: null,
                path: "@hubspot/email_footer",
                schema_version: 2,
                startPosition: -729,
                unsubscribe_link_type: "both",
              },
              child_css: {},
              css: {},
              id: "module-2-0-0",
              label: null,
              module_id: 2869621,
              name: "module-2-0-0",
              order: 4,
              smart_type: null,
              styles: {},
              type: "module",
            },
            preview_text: {
              body: {
                value: req.body.payload.preview,
              },
              child_css: {},
              css: {},
              id: "preview_text",
              label:
                "Preview Text <span class=help-text>This will be used as the preview text that displays in some email clients</span>",
              name: "preview_text",
              order: 0,
              smart_type: null,
              styles: {},
              type: "text",
            },
          },
        },
        name: req.body.payload.name,
        subject: req.body.payload.subject,
        from: {
          fromName: "Nic Doelger",
          replyTo: "doelgern@gmail.com",
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
      id: response.data.id,
    };

    await prisma.email.create({
      data: { ...emailData, user_id: tokenCache.get(REFRESH_SECRET) },
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
