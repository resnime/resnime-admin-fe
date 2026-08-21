import { Form, Modal } from "antd";
import { createContext, useContext, useState } from "react";
import {
  fetchAnimeFromTurso,
  scrapeAnime,
  submitAnimeToTurso,
} from "../services/animeApi.js";
import { normalizeAnimeEpisodeDates } from "../utils/episodeDate.js";

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

const HomeContext = createContext(null);

/**
 * Custom hook to consume Home context
 * @returns {object} Home context value
 */
export function useHomeCtx() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHomeCtx must be used within a HomeCtxProvider");
  }
  return context;
}

export function HomeCtxProvider({ children, messageApi }) {
  const [scrapeForm] = Form.useForm();
  const [animeForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [fetchingTursoAnime, setFetchingTursoAnime] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState([]);

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
      messageApi?.error?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromTurso = async (idToFetch) => {
    if (fetchingTursoAnime) return;

    let malId = idToFetch;
    if (typeof malId !== "string" && typeof malId !== "number") {
      malId =
        animeForm.getFieldValue("id") || scrapeForm.getFieldValue("malId");
    }
    if (!Number.isInteger(Number(malId)) || Number(malId) <= 0) {
      messageApi?.error?.("Masukkan MyAnimeList ID yang valid.");
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
      messageApi?.success?.("Turso data has been applied to the form.");
    } catch (error) {
      messageApi?.error?.(error.message);
    } finally {
      setFetchingTursoAnime(false);
    }
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

    messageApi?.error?.(error.message);
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
          messageApi?.success?.(
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

  const value = {
    scrapeForm,
    animeForm,
    loading,
    setLoading,
    fetchingTursoAnime,
    setFetchingTursoAnime,
    submitting,
    setSubmitting,
    warnings,
    setWarnings,
    formValues,
    setFormValues,
    hasData,
    setHasData,
    emptyAnime,
    updatePreview,
    handleValuesChange,
    saveToDraftAndState,
    handleScrape,
    handleFetchFromTurso,
    handleSubmitToTurso,
    showSubmitError,
    messageApi,
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export default HomeCtxProvider;
