import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import React from "react";
import { mergeEpisodeRange } from "../utils/episodes.js";

const { Text } = Typography;

export default function EpisodeEditor({ form }) {
  const episodeTotal = Form.useWatch("episode_total", form);
  const episodes = Form.useWatch("episodes", form) || [];
  const [messageApi, contextHolder] = message.useMessage();

  const generateRange = (start, end) => {
    try {
      form.setFieldValue(
        "episodes",
        mergeEpisodeRange(form.getFieldValue("episodes") || [], start, end),
      );
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  return (
    <Card title="Episodes">
      {contextHolder}
      <Space direction="vertical" size="middle" className="full-width">
        {Number.isInteger(Number(episodeTotal)) && Number(episodeTotal) > 0 ? (
          <Space wrap>
            <Text>Detected episode total: {episodeTotal}</Text>
            <Button onClick={() => generateRange(1, Number(episodeTotal))}>
              Generate Episodes 1-{episodeTotal}
            </Button>
          </Space>
        ) : null}

        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={8}>
            <Form.Item label="Start Episode" name="episode_range_start">
              <InputNumber min={1} precision={0} className="full-width" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label="End Episode" name="episode_range_end">
              <InputNumber min={1} precision={0} className="full-width" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              onClick={() =>
                generateRange(
                  form.getFieldValue("episode_range_start"),
                  form.getFieldValue("episode_range_end"),
                )
              }
              className="full-width"
            >
              Generate Range
            </Button>
          </Col>
        </Row>

        <Form.List name="episodes">
          {(fields, { add, remove }) => (
            <Space direction="vertical" size="middle" className="full-width">
              <Button
                icon={<PlusOutlined />}
                onClick={() =>
                  add({
                    episode_number: nextEpisodeNumber(episodes),
                    thumbnail_url: null,
                    links: [],
                  })
                }
              >
                Add Episode
              </Button>
              <div className="editor-list-scroll episode-editor-scroll">
                <Collapse
                  items={fields.map((field) => ({
                    key: field.key,
                    label: `Episode ${episodes?.[field.name]?.episode_number || field.name + 1}`,
                    extra: (
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={(event) => {
                          event.stopPropagation();
                          remove(field.name);
                        }}
                      />
                    ),
                    children: (
                      <>
                        <Row gutter={[12, 0]}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Episode Number"
                              name={[field.name, "episode_number"]}
                            >
                              <InputNumber
                                min={1}
                                precision={0}
                                className="full-width"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={16}>
                            <Form.Item
                              label="Thumbnail URL"
                              name={[field.name, "thumbnail_url"]}
                            >
                              <Input allowClear />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Divider orientation="left">Embed URLs</Divider>
                        <Form.List name={[field.name, "links"]}>
                          {(linkFields, linkOps) => (
                            <Space direction="vertical" className="full-width">
                              {linkFields.map((linkField) => (
                                <Space.Compact
                                  key={linkField.key}
                                  className="full-width"
                                >
                                  <Form.Item
                                    name={[linkField.name, "embed_url"]}
                                    className="compact-form-item"
                                  >
                                    <Input placeholder="https://example.com/embed/..." />
                                  </Form.Item>
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => linkOps.remove(linkField.name)}
                                  />
                                </Space.Compact>
                              ))}
                              <Button
                                icon={<PlusOutlined />}
                                onClick={() => linkOps.add({ embed_url: "" })}
                              >
                                Add Embed URL
                              </Button>
                            </Space>
                          )}
                        </Form.List>
                      </>
                    ),
                  }))}
                />
              </div>
            </Space>
          )}
        </Form.List>
      </Space>
    </Card>
  );
}

function nextEpisodeNumber(episodes) {
  const max = Math.max(
    0,
    ...episodes.map((episode) => Number(episode?.episode_number) || 0),
  );
  return max + 1;
}
