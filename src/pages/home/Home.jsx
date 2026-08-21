import { Alert, Form, Modal, Space } from "antd";
import { useState } from "react";

import HomeFormActionBtn from "../../components/home/HomeFormActionBtn.jsx";
import AnimePreview from "../../components/home/AnimePreview.jsx";
import HomeFormSkeleton from "../../components/home/HomeFormSkeleton.jsx";
import HomeHeaderSearch from "../../components/home/home-header-search/index.jsx";
import {
  fetchAnimeFromTurso,
  scrapeAnime,
  submitAnimeToTurso,
} from "../../services/animeApi.js";
import { normalizeAnimeEpisodeDates } from "../../utils/episodeDate.js";

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

const LOCAL_STORAGE_KEY = "resnime_admin_draft";

export default function Home({ messageApi }) {
  const [scrapeForm] = Form.useForm();
  const [animeForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [fetchingTursoAnime, setFetchingTursoAnime] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState([]);
  // Track form values in state to avoid useWatch
  // Initialize lazily from localStorage to avoid unnecessary useEffect
  const [formValues, setFormValues] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    return emptyAnime;
  });

  const [hasData, setHasData] = useState(() => {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY);
  });

  // Since we initialize form state lazily, we also need to initialize the form instance if hasData is true
  // but form instance is passed to Form which can take initialValues={formValues} if we want.
  // Wait, Form initialValues only works on first render. So it should work perfectly with lazy init.

  const updatePreview = () => {
    const currentValues = normalizeAnimeEpisodeDates(
      animeForm.getFieldsValue(true),
    );
    setFormValues(currentValues);
  };

  const handleValuesChange = (_, allValues) => {
    const currentValues = normalizeAnimeEpisodeDates(allValues);
    setFormValues(currentValues);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentValues));
  };

  const saveToDraftAndState = (data) => {
    animeForm.setFieldsValue(data);
    setFormValues(data);
    setHasData(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const handleScrape = async ({ malId }) => {
    setLoading(true);
    setWarnings([]);
    try {
      const result = await scrapeAnime(String(malId));
      const scrapedAnime = normalizeAnimeEpisodeDates({
        ...emptyAnime,
        ...result.data,
      });
      saveToDraftAndState(scrapedAnime);
      setWarnings(result.warnings || []);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromTurso = async (idToFetch) => {
    if (fetchingTursoAnime) return;

    // Use idToFetch if provided (e.g. from modal) or fallback to form values
    let malId = idToFetch;
    if (typeof malId !== "string" && typeof malId !== "number") {
      malId =
        animeForm.getFieldValue("id") || scrapeForm.getFieldValue("malId");
    }
    if (!Number.isInteger(Number(malId)) || Number(malId) <= 0) {
      messageApi.error("Masukkan MyAnimeList ID yang valid.");
      return;
    }

    setFetchingTursoAnime(true);
    setWarnings([]);
    try {
      const result = await fetchAnimeFromTurso(malId);
      const fetchedAnime = normalizeAnimeEpisodeDates({
        ...emptyAnime,
        ...result.data,
      });
      saveToDraftAndState(fetchedAnime);
      scrapeForm.setFieldsValue({ malId: fetchedAnime.id });
      messageApi.success("Turso data has been applied to the form.");
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setFetchingTursoAnime(false);
    }
  };

  const handleSubmitToTurso = async () => {
    await animeForm.validateFields();
    const values = normalizeAnimeEpisodeDates(animeForm.getFieldsValue(true));

    Modal.confirm({
      title: "Submit anime to Turso?",
      content:
        "Submitting the same MyAnimeList ID will update the anime (including Anilist ID) and replace its episodes, embed links, characters, and voice actors with the current form data.",
      okText: "Submit",
      cancelText: "Cancel",
      onOk: async () => {
        setSubmitting(true);
        try {
          const result = await submitAnimeToTurso(values);
          setFormValues(values);
          const operation = result.data.operation;
          const counts = result.data.counts;
          messageApi.success(
            `Anime ${operation} successfully (${counts.episodes} episodes, ${counts.episode_links} links, ${counts.characters} characters, ${counts.voice_actors} voice actors)`,
          );
          // Optional: Clear draft on success? We'll just keep it or let user manually clear.
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
    <>
      <HomeHeaderSearch
        scrapeForm={scrapeForm}
        onScrape={handleScrape}
        isScraping={loading}
        onFetchFromTurso={handleFetchFromTurso}
      />

      {warnings.length ? (
        <Space direction="vertical" className="full-width warning-list">
          {warnings.map((warning) => (
            <Alert key={warning} type="warning" showIcon message={warning} />
          ))}
        </Space>
      ) : null}

      {fetchingTursoAnime ? (
        <HomeFormSkeleton />
      ) : (
        <>
          <Form
            form={animeForm}
            layout="vertical"
            initialValues={formValues}
            onValuesChange={handleValuesChange}
          >
            <AnimePreview anime={formValues} form={animeForm} />
          </Form>

          {hasData ? (
            <HomeFormActionBtn
              fetchingTursoAnime={fetchingTursoAnime}
              submitting={submitting}
              onFetchFromTurso={handleFetchFromTurso}
              onUpdatePreview={updatePreview}
              onSubmitToTurso={handleSubmitToTurso}
            />
          ) : null}
        </>
      )}
    </>
  );
}
