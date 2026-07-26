import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Layout,
  Space,
  Typography,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import AnimeForm from "./components/AnimeForm.jsx";
import AnimePreview from "./components/AnimePreview.jsx";
import { scrapeAnime } from "./services/animeApi.js";

const { Content } = Layout;
const { Paragraph, Title } = Typography;

const emptyAnime = {
  id: "",
  title_en: "",
  title_romaji: "",
  photo: "",
  rating: 0,
  status: "",
  aired: "",
  season: "",
  type: "",
  studio: "",
  description: "",
  banner_bg_img: "",
  genres: [],
  episode_total: null,
  episodes: [],
  characters: [],
};

export default function App() {
  const [scrapeForm] = Form.useForm();
  const [animeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [previewAnime, setPreviewAnime] = useState(emptyAnime);
  const [messageApi, contextHolder] = message.useMessage();
  const updatePreview = () => setPreviewAnime(animeForm.getFieldsValue(true));

  const handleScrape = async ({ malId }) => {
    setLoading(true);
    setWarnings([]);
    try {
      const result = await scrapeAnime(String(malId));
      const scrapedAnime = { ...emptyAnime, ...result.data };
      animeForm.setFieldsValue(scrapedAnime);
      setPreviewAnime(scrapedAnime);
      setHasData(true);
      setWarnings(result.warnings || []);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="app-shell">
      {contextHolder}
      <Content className="container">
        <header className="header">
          <Title>Resnime Admin Importer</Title>
          <Paragraph>
            Tool admin untuk mengambil data MyAnimeList dan mereview hasilnya
            secara manual sebelum masuk database.
          </Paragraph>
        </header>

        <Card className="scrape-card">
          <Form
            form={scrapeForm}
            layout="inline"
            onFinish={handleScrape}
            className="scrape-form"
          >
            <Form.Item
              label="MyAnimeList ID"
              name="malId"
              rules={[
                { required: true, message: "Masukkan MyAnimeList ID." },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null || value === "")
                      return Promise.resolve();
                    return Number.isInteger(Number(value)) && Number(value) > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("ID harus angka positif."));
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                precision={0}
                controls={false}
                className="mal-input"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
              >
                Scrape Anime
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {warnings.length ? (
          <Space direction="vertical" className="full-width warning-list">
            {warnings.map((warning) => (
              <Alert key={warning} type="warning" showIcon message={warning} />
            ))}
          </Space>
        ) : null}

        <Form form={animeForm} layout="vertical" initialValues={emptyAnime}>
          <AnimePreview anime={previewAnime} />
          {hasData ? <AnimeForm form={animeForm} /> : null}
        </Form>
        {hasData ? (
          <Button
            type="primary"
            size="large"
            className="fixed-update-preview-button"
            onClick={updatePreview}
          >
            Update Preview
          </Button>
        ) : null}
      </Content>
    </Layout>
  );
}
