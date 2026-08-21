import { Button, Space } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

export default function HomeFormActionBtn({
  fetchingTursoAnime,
  submitting,
  onFetchFromTurso,
  onUpdatePreview,
  onSubmitToTurso,
}) {
  return (
    <Space className="fixed-form-actions">
      <Button
        size="large"
        icon={<DatabaseOutlined />}
        loading={fetchingTursoAnime}
        disabled={fetchingTursoAnime}
        onClick={onFetchFromTurso}
      >
        Fetch from Turso
      </Button>
      <Button size="large" onClick={onUpdatePreview}>
        Update Preview
      </Button>
      <Button
        type="primary"
        size="large"
        icon={<DatabaseOutlined />}
        loading={submitting}
        disabled={submitting}
        onClick={onSubmitToTurso}
      >
        Submit to Turso
      </Button>
    </Space>
  );
}
