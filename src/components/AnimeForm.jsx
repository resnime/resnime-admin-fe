import {
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import React from "react";
import EpisodeEditor from "./EpisodeEditor.jsx";
import CharacterEditor from "./CharacterEditor.jsx";

const { TextArea } = Input;

export default function AnimeForm({
  form,
  metadataExtra = null,
}) {
  return (
    <section className="section">
      <Divider orientation="left">Editable Anime Form</Divider>
      <Space direction="vertical" size="large" className="full-width">
        <Card title="Metadata" extra={metadataExtra}>
          <Row gutter={[16, 0]}>

            <Col xs={24} md={8}>
              <Form.Item
                label="MAL ID"
                name="id"
                rules={[
                  { required: true, message: "MAL ID is required." },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "MAL ID must be a positive digit string.",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                extra={
                  <Typography.Text>
                    Search on google:{" "}
                    <Typography.Link
                      target="_blank"
                      href={`https://google.com/search?q=${form?.getFieldValue("title_romaji") || ""} Anilist`}
                    >
                      {form?.getFieldValue("title_romaji") || ""} Anilist
                    </Typography.Link>
                  </Typography.Text>
                }
                label="Anilist ID"
                name="anilist_id"
                rules={[
                  { required: true, message: "Anilist ID is required." },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "Anilist ID must be a positive digit string.",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="English Title" name="title_en">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Native Title" name="title_native">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Romaji Title" name="title_romaji">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Rating"
                name="rating"
                rules={[
                  { required: true, message: "Rating is required." },
                  {
                    type: "number",
                    min: 0,
                    message: "Rating must be a non-negative number.",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[
                  { required: true, message: "Status is required." },
                  {
                    enum: ["Ongoing", "Finished"],
                    message: "Status must be Ongoing or Finished.",
                  },
                ]}
              >
                <Select
                  allowClear
                  options={[{ value: "Ongoing" }, { value: "Finished" }]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Detected Episode Total" name="episode_total">
                <InputNumber min={1} precision={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Aired" name="aired">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Season" name="season">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Type" name="type">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Studio" name="studio">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Genres" name="genres">
                <Select mode="tags" tokenSeparators={[","]} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Poster URL" name="photo">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Banner URL" name="banner_bg_img">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Description" name="description">
                <TextArea rows={5} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <EpisodeEditor form={form} />
        <CharacterEditor form={form} />
      </Space>
    </section>
  );
}
