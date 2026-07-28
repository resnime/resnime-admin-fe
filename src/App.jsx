import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Layout,
  Modal,
  Segmented,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { DatabaseOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, Suspense, lazy } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import AnimeForm from "./components/AnimeForm.jsx";
import AnimePreview from "./components/AnimePreview.jsx";

import { scrapeAnime, submitAnimeToTurso } from "./services/animeApi.js";
import { normalizeAnimeEpisodeDates } from "./utils/episodeDate.js";
import { getActiveMode } from "./utils/routes.js";

const { Content } = Layout;
const { Paragraph, Title } = Typography;

const emptyAnime = {
  id: "",
  title_en: "",
  title_native: "",
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

const BulkImport = lazy(() => import("./components/BulkImport.jsx"));

export default function App() {
  const [scrapeForm] = Form.useForm();
  const [animeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [previewAnime, setPreviewAnime] = useState(emptyAnime);
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const activeMode = getActiveMode(location.pathname);
  const updatePreview = () =>
    setPreviewAnime(normalizeAnimeEpisodeDates(animeForm.getFieldsValue(true)));

  const handleScrape = async ({ malId }) => {
    setLoading(true);
    setWarnings([]);
    try {
      const result = await scrapeAnime(String(malId));
      const scrapedAnime = normalizeAnimeEpisodeDates({ ...emptyAnime, ...result.data });
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

  const handleSubmitToTurso = async () => {
    await animeForm.validateFields();
    const values = normalizeAnimeEpisodeDates(animeForm.getFieldsValue(true));

    Modal.confirm({
      title: "Submit anime to Turso?",
      content:
        "Submitting the same MyAnimeList ID will update the anime and replace its episodes, embed links, characters, and voice actors with the current form data.",
      okText: "Submit",
      cancelText: "Cancel",
      onOk: async () => {
        setSubmitting(true);
        try {
          const result = await submitAnimeToTurso(values);
          setPreviewAnime(values);
          const operation = result.data.operation;
          const counts = result.data.counts;
          messageApi.success(
            `Anime ${operation} successfully (${counts.episodes} episodes, ${counts.episode_links} links, ${counts.characters} characters, ${counts.voice_actors} voice actors)`,
          );
        } catch (error) {
          showSubmitError(error);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const showSubmitError = (error) => {
    if (error.details?.length) {
      Modal.error({
        title: error.message,
        content: (
          <ul className="submit-error-list">
            {error.details.map((detail) => (
              <li key={`${detail.field}-${detail.message}`}>
                <strong>{detail.field}</strong>: {detail.message}
              </li>
            ))}
          </ul>
        ),
      });
      return;
    }

    messageApi.error(error.message);
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

        <Segmented
          className="mode-switch"
          options={[
            { label: "Manual Input", value: "manual" },
            { label: "Bulk Insert", value: "bulk" },
          ]}
          value={activeMode}
          onChange={(nextMode) =>
            navigate(nextMode === "bulk" ? "/bulk" : "/manual")
          }
        />

        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <Spin size="large" tip="Loading..." />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/manual" replace />} />
            <Route
              path="/manual"
              element={
                <ManualInput
                  scrapeForm={scrapeForm}
                  animeForm={animeForm}
                  loading={loading}
                  submitting={submitting}
                  warnings={warnings}
                  hasData={hasData}
                  previewAnime={previewAnime}
                  handleScrape={handleScrape}
                  handleSubmitToTurso={handleSubmitToTurso}
                  updatePreview={updatePreview}
                />
              }
            />
            <Route
              path="/bulk"
              element={<BulkImport messageApi={messageApi} />}
            />
            <Route
              path="/bulk/:animeId/review"
              element={<BulkImport messageApi={messageApi} />}
            />
            <Route path="*" element={<Navigate to="/manual" replace />} />
          </Routes>
        </Suspense>
      </Content>
    </Layout>
  );
}

function ManualInput({
  scrapeForm,
  animeForm,
  loading,
  submitting,
  warnings,
  hasData,
  previewAnime,
  handleScrape,
  handleSubmitToTurso,
  updatePreview,
}) {
  return (
    <>
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
        <Space className="fixed-form-actions">
          <Button size="large" onClick={updatePreview}>
            Update Preview
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<DatabaseOutlined />}
            loading={submitting}
            disabled={submitting}
            onClick={handleSubmitToTurso}
          >
            Submit to Turso
          </Button>
        </Space>
      ) : null}
    </>
  );
}
