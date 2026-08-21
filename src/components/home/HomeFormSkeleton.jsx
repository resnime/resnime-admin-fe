import {
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  List,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";

const { Title } = Typography;

export default function HomeFormSkeleton() {
  return (
    <>
      <section className="section">
        <Title level={3}>Preview</Title>
        <Card>
          <Skeleton.Node
            active
            style={{
              width: "100%",
              height: 200,
              marginBottom: 20,
              borderRadius: 8,
            }}
          >
            <div />
          </Skeleton.Node>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={7} lg={5}>
              <Skeleton.Node
                active
                style={{
                  width: "100%",
                  maxWidth: 240,
                  height: 320,
                  borderRadius: 8,
                }}
              >
                <div />
              </Skeleton.Node>
            </Col>
            <Col xs={24} md={17} lg={19}>
              <Skeleton.Input
                active
                style={{ width: 320, height: 28, marginBottom: 12 }}
              />
              <Space
                direction="vertical"
                size={4}
                style={{ display: "flex", marginBottom: 16 }}
              >
                <Skeleton.Input active size="small" style={{ width: 220 }} />
                <Skeleton.Input active size="small" style={{ width: 200 }} />
              </Space>

              <Descriptions
                className="meta"
                size="small"
                column={{ xs: 1, md: 2, xl: 3 }}
              >
                <Descriptions.Item label="Rating">
                  <Skeleton.Input active size="small" style={{ width: 60 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Aired">
                  <Skeleton.Input active size="small" style={{ width: 100 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Season">
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Skeleton.Input active size="small" style={{ width: 60 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Studio">
                  <Skeleton.Input active size="small" style={{ width: 90 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Detected episode total">
                  <Skeleton.Input active size="small" style={{ width: 40 }} />
                </Descriptions.Item>
              </Descriptions>

              <Skeleton
                active
                paragraph={{ rows: 3, width: ["100%", "90%", "75%"] }}
                title={false}
              />

              <Space size={[6, 6]} wrap style={{ marginTop: 16 }}>
                {[1, 2, 3, 4, 5].map((key) => (
                  <Skeleton.Button
                    key={key}
                    active
                    size="small"
                    style={{ width: 64, height: 22, borderRadius: 4 }}
                  />
                ))}
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} className="preview-lists">
          <Col xs={24} lg={12}>
            <Card title="Episodes">
              <div className="episode-preview-scroll">
                <List
                  dataSource={[1, 2, 3, 4, 5]}
                  renderItem={(item) => (
                    <List.Item key={item}>
                      <Skeleton.Input active size="small" style={{ width: 100 }} />
                      <Skeleton.Input active size="small" style={{ width: 80 }} />
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Characters">
              <div className="character-preview-scroll">
                <List
                  dataSource={[1, 2, 3]}
                  renderItem={(item) => (
                    <List.Item key={item} align="top">
                      <List.Item.Meta
                        avatar={
                          <Skeleton.Node
                            active
                            style={{
                              width: 48,
                              height: 64,
                              borderRadius: 6,
                            }}
                          >
                            <div />
                          </Skeleton.Node>
                        }
                        title={
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: 160 }}
                          />
                        }
                        description={
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: 220, marginTop: 6 }}
                          />
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="section">
        <Divider orientation="left">Editable Anime Form</Divider>
        <Space direction="vertical" size="large" className="full-width">
          <Card title="Metadata">
            <Form layout="vertical">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item label="MAL ID">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="Anilist ID">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="English Title">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Native Title">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Romaji Title">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Rating">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Status">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Detected Episode Total">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Aired">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Season">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Type">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Studio">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Genres">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Poster URL">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Banner URL">
                    <Skeleton.Input active style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Description">
                    <Skeleton.Node
                      active
                      style={{ width: "100%", height: 114, borderRadius: 6 }}
                    >
                      <div />
                    </Skeleton.Node>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title="Episodes">
            <Space direction="vertical" size="middle" className="full-width">
              <Row gutter={12} align="bottom">
                <Col xs={24} md={6}>
                  <Skeleton.Input active style={{ width: "100%" }} />
                </Col>
                <Col xs={24} md={6}>
                  <Skeleton.Input active style={{ width: "100%" }} />
                </Col>
                <Col xs={24} md={6}>
                  <Skeleton.Button active style={{ width: 140 }} />
                </Col>
              </Row>
              <List
                dataSource={[1, 2, 3]}
                renderItem={(item) => (
                  <List.Item key={item}>
                    <Skeleton.Input active size="small" style={{ width: "40%" }} />
                    <Skeleton.Input active size="small" style={{ width: "30%" }} />
                  </List.Item>
                )}
              />
            </Space>
          </Card>

          <Card title="Characters">
            <Space direction="vertical" size="middle" className="full-width">
              <Row justify="space-between" align="middle">
                <Col>
                  <Skeleton.Input active style={{ width: 180 }} />
                </Col>
                <Col>
                  <Skeleton.Button active style={{ width: 120 }} />
                </Col>
              </Row>
              {[1, 2].map((item) => (
                <Card key={item} type="inner">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Skeleton.Input active style={{ width: "100%" }} />
                    </Col>
                    <Col xs={24} md={8}>
                      <Skeleton.Input active style={{ width: "100%" }} />
                    </Col>
                    <Col xs={24} md={8}>
                      <Skeleton.Input active style={{ width: "100%" }} />
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        </Space>
      </section>

      <Space className="fixed-form-actions">
        <Skeleton.Button active size="large" style={{ width: 160 }} />
        <Skeleton.Button active size="large" style={{ width: 140 }} />
        <Skeleton.Button active size="large" style={{ width: 150 }} />
      </Space>
    </>
  );
}
