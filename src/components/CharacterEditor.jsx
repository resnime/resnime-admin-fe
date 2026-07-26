import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Row,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import React from "react";

export default function CharacterEditor() {
  return (
    <Card title="Characters">
      <Form.List name="characters">
        {(fields, { add, remove }) => (
          <Space direction="vertical" size="middle" className="full-width">
            <Button
              icon={<PlusOutlined />}
              onClick={() =>
                add({ name: "", photo: "", role: "", voice_actors: [] })
              }
            >
              Add Character
            </Button>
            <div className="editor-list-scroll character-editor-scroll">
              <Collapse
                items={fields.map((field) => ({
                  key: field.key,
                  label: (
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue }) =>
                        getFieldValue(["characters", field.name, "name"]) ||
                        `Character ${field.name + 1}`
                      }
                    </Form.Item>
                  ),
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
                        <Col xs={24} md={10}>
                          <Form.Item label="Name" name={[field.name, "name"]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Role" name={[field.name, "role"]}>
                            <Input placeholder="Main or Supporting" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                          <Form.Item
                            label="Photo URL"
                            name={[field.name, "photo"]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider orientation="left">Voice Actors</Divider>
                      <Form.List name={[field.name, "voice_actors"]}>
                        {(voiceFields, voiceOps) => (
                          <Space direction="vertical" className="full-width">
                            {voiceFields.map((voiceField) => (
                              <Card
                                size="small"
                                key={voiceField.key}
                                title={`Voice Actor ${voiceField.name + 1}`}
                                extra={
                                  <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      voiceOps.remove(voiceField.name)
                                    }
                                  />
                                }
                              >
                                <Row gutter={[12, 0]}>
                                  <Col xs={24} md={8}>
                                    <Form.Item
                                      label="Name"
                                      name={[voiceField.name, "name"]}
                                    >
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={8}>
                                    <Form.Item
                                      label="Photo URL"
                                      name={[voiceField.name, "photo"]}
                                    >
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={8}>
                                    <Form.Item
                                      label="Country"
                                      name={[voiceField.name, "country"]}
                                    >
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                            <Button
                              icon={<PlusOutlined />}
                              onClick={() =>
                                voiceOps.add({
                                  name: "",
                                  photo: "",
                                  country: "",
                                })
                              }
                            >
                              Add Voice Actor
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
    </Card>
  );
}
