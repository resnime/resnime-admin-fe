import { Button, Card, Col } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import HomeEpisodePreview from "./preview/index.jsx";
import HomeEpisodeForm from "./form/index.jsx";

export default function HomeEpisode({ form, episodes = [], episodeTotal }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Col xs={24} lg={12}>
      <Card
        title="Episodes"
        extra={
          <Button
            icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Preview" : "Edit"}
          </Button>
        }
      >
        {isEditing ? (
          <HomeEpisodeForm
            form={form}
            episodeTotal={episodeTotal}
            episodes={episodes}
          />
        ) : (
          <HomeEpisodePreview episodes={episodes} />
        )}
      </Card>
    </Col>
  );
}
