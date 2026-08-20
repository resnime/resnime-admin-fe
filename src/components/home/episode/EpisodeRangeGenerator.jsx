import { Button, Col, Form, InputNumber, Row, Space, Typography, message } from "antd";
import { mergeEpisodeRange } from "../../../utils/episodes.js";

const { Text } = Typography;

export default function EpisodeRangeGenerator({ form, episodeTotal }) {
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
    <>
      {contextHolder}
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
    </>
  );
}
