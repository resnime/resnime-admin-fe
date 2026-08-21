import { Alert, Form, Space } from "antd";

import HomeCtxProvider, { useHomeCtx } from "../../context/HomeCtxProvider.jsx";
import HomeFormActionBtn from "../../components/home/HomeFormActionBtn.jsx";
import AnimePreview from "../../components/home/AnimePreview.jsx";
import HomeFormSkeleton from "../../components/home/HomeFormSkeleton.jsx";
import HomeHeaderSearch from "../../components/home/home-header-search/index.jsx";

function HomeContent() {
  const {
    animeForm,
    formValues,
    handleValuesChange,
    warnings,
    fetchingTursoAnime,
    hasData,
  } = useHomeCtx();

  return (
    <>
      <HomeHeaderSearch />

      {warnings.length ? (
        <Space orientation="vertical" className="full-width warning-list">
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
            <AnimePreview />
          </Form>

          {hasData ? <HomeFormActionBtn /> : null}
        </>
      )}
    </>
  );
}

export default function Home({ messageApi }) {
  return (
    <HomeCtxProvider messageApi={messageApi}>
      <HomeContent />
    </HomeCtxProvider>
  );
}
