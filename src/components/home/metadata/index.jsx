import { Button, Card } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import HomeMetadataPreview from "./preview/index.jsx";
import HomeMetadataForm from "./form/index.jsx";

export default function HomeMetadata() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card
      title="Metadata"
      extra={
        <Button
          icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Preview" : "Edit"}
        </Button>
      }
    >
      {isEditing ? <HomeMetadataForm /> : <HomeMetadataPreview />}
    </Card>
  );
}
