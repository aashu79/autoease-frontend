import { Typography } from "antd";

const { Text } = Typography;

function FormError({ message }) {
  if (!message) {
    return null;
  }

  return <Text type="danger" className="mt-1 block text-sm">{message}</Text>;
}

export default FormError;
