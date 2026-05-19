import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Typography, message } from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormError from "../components/form/FormError";
import { useAuth } from "../hooks/useAuth";
import { apiMessage } from "../utils/api";
import { fieldStatus, loginSchema } from "../utils/forms";
import { getDashboardPath } from "../utils/auth";

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitForm = async (values) => {
    try {
      setLoading(true);
      const profile = await login(values);
      message.success("Login successful.");

      const fallbackPath = getDashboardPath(profile?.Role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;
      navigate(redirectPath, { replace: true });
    } catch (error) {
      message.error(apiMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page px-4 py-10 md:px-8">
      <Card className="auth-card shadow-xl">
        <div className="auth-panel">
          <span className="auth-kicker">Welcome back</span>
          <Title className="!mb-6 !font-display">Login to your account</Title>

          <form onSubmit={handleSubmit(submitForm)}>
            <div className="mb-4">
              <label className="form-label">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="user@example.com"
                    size="large"
                    status={fieldStatus(errors.email)}
                  />
                )}
              />
              <FormError message={errors.email?.message} />
            </div>

            <div className="mb-5">
              <label className="form-label">Password</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="password123"
                    size="large"
                    status={fieldStatus(errors.password)}
                  />
                )}
              />
              <FormError message={errors.password?.message} />
            </div>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Login
            </Button>
          </form>

          <Text className="mt-5 block text-center text-slate-500">
            No account yet? <Link to="/register">Create one</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default Login;
