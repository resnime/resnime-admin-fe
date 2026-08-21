import { Button, Card, Col } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import HomeCharacterPreview from "./preview/index.jsx";
import HomeCharacterForm from "./form/index.jsx";

export default function HomeCharacter() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Col xs={24} lg={12}>
      <Card
        title="Characters"
        extra={
          <Button
            icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Preview" : "Edit"}
          </Button>
        }
      >
        {isEditing ? <HomeCharacterForm /> : <HomeCharacterPreview />}
      </Card>
    </Col>
  );
}
