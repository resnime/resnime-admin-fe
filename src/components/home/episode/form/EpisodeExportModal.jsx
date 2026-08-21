import { Button, Modal, Typography, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const { Paragraph } = Typography;

export default function EpisodeExportModal({ episodes, isOpen, onClose }) {
  const [messageApi, contextHolder] = message.useMessage();
  const jsonString = JSON.stringify(episodes || [], null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      messageApi.success("JSON copied to clipboard");
    } catch {
      messageApi.error("Failed to copy JSON");
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Export Episode Links JSON"
        open={isOpen}
        onCancel={onClose}
        footer={
          <Button icon={<CopyOutlined />} type="primary" onClick={handleCopy}>
            Copy JSON
          </Button>
        }
        width={700}
      >
        <Paragraph>
          You can copy this JSON and use it later to import episode links.
        </Paragraph>

        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            maxHeight: "60vh",
            borderRadius: "8px",
            border: "1px solid #303030",
            fontSize: "14px",
            margin: 0,
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </Modal>
    </>
  );
}
