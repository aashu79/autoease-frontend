import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Input,
  Rate,
  Tabs,
  Typography,
  message,
  List,
  Card,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiCheckCircle,
  FiMessageSquare,
  FiSend,
  FiStar,
  FiTool,
  FiList,
} from "react-icons/fi";
import { partRequestService, reviewService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import FormError from "../../components/form/FormError";
import { apiMessage, listData } from "../../utils/api";
import {
  fieldStatus,
  partRequestSchema,
  reviewSchema,
} from "../../utils/forms";

const { TextArea } = Input;
const { Text, Title } = Typography;

const rateDescriptions = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

// ─── Part Request Tab ────────────────────────────────────────────────────────

function PartRequestTab() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partRequestSchema),
    defaultValues: { partName: "" },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      await partRequestService.createPartRequest({ partName: values.partName });
      message.success("Part request submitted successfully!");
      setSubmitted(true);
      reset();
    } catch (err) {
      message.error(apiMessage(err, "Failed to submit part request."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardSection
      title="Request a Part"
      subtitle="Can't find what you need? Let us know and we'll source it for you."
    >
      <div className="mx-auto max-w-xl">
        {submitted && (
          <Alert
            type="success"
            showIcon
            icon={<FiCheckCircle />}
            message="Request submitted!"
            description="We've received your part request and will get back to you shortly."
            closable
            onClose={() => setSubmitted(false)}
            className="mb-6 !rounded-lg"
          />
        )}

        <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/40 p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
              <FiTool size={18} />
            </span>
            <div>
              <Title level={5} className="!mb-0.5 !text-slate-800">
                Part Request Form
              </Title>
              <Text className="text-sm text-slate-500">
                Describe the part you need and our team will find it for you.
              </Text>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="form-label">
                Part Name <span className="text-red-400">*</span>
              </label>
              <Controller
                name="partName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder="e.g. Brake pad set for Toyota Corolla 2019"
                    status={fieldStatus(errors.partName)}
                    prefix={<FiTool className="text-slate-300" />}
                    allowClear
                  />
                )}
              />
              <FormError message={errors.partName?.message} />
              <Text className="mt-1.5 block text-xs text-slate-400">
                Be as specific as possible — include make, model, and year if
                applicable.
              </Text>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<FiSend />}
              className="!bg-teal-600 hover:!bg-teal-700 !mt-1 self-start"
            >
              Submit Request
            </Button>
          </form>
        </div>
      </div>
    </DashboardSection>
  );
}

// ─── Review Tab ──────────────────────────────────────────────────────────────

function ReviewTab() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const currentRating = watch("rating");

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      await reviewService.createReview({
        rating: Number(values.rating),
        comment: values.comment,
      });
      message.success("Review submitted! Thank you for your feedback.");
      setSubmitted(true);
      reset();
    } catch (err) {
      message.error(apiMessage(err, "Failed to submit review."));
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoveredStar || currentRating;
  const ratingLabel =
    activeRating > 0 ? rateDescriptions[activeRating - 1] : null;

  return (
    <DashboardSection
      title="Write a Review"
      subtitle="Share your experience with our auto service team."
    >
      <div className="mx-auto max-w-xl">
        {submitted && (
          <Alert
            type="success"
            showIcon
            icon={<FiCheckCircle />}
            message="Thank you for your feedback!"
            description="Your review has been submitted and helps us serve you better."
            closable
            onClose={() => setSubmitted(false)}
            className="mb-6 !rounded-lg"
          />
        )}

        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <FiStar size={18} />
            </span>
            <div>
              <Title level={5} className="!mb-0.5 !text-slate-800">
                Service Review
              </Title>
              <Text className="text-sm text-slate-500">
                Rate your experience and leave a comment for our team.
              </Text>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Rating */}
            <div>
              <label className="form-label">
                Your Rating <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col gap-2">
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Rate
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      onHoverChange={(val) => setHoveredStar(val)}
                      className="!text-3xl [&_.ant-rate-star]:!mr-2"
                    />
                  )}
                />
                <div className="flex h-6 items-center">
                  {ratingLabel ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-sm font-semibold text-amber-700">
                      <FiStar size={12} />
                      {ratingLabel}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Click to rate
                    </span>
                  )}
                </div>
              </div>
              <FormError message={errors.rating?.message} />
            </div>

            {/* Comment */}
            <div>
              <label className="form-label">
                <span className="flex items-center gap-1.5">
                  <FiMessageSquare size={14} className="text-slate-400" />
                  Your Comment <span className="text-red-400">*</span>
                </span>
              </label>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    rows={4}
                    placeholder="Tell us about your experience — what did we do well? What can we improve?"
                    status={fieldStatus(errors.comment)}
                    showCount
                    maxLength={500}
                    className="!resize-none"
                  />
                )}
              />
              <FormError message={errors.comment?.message} />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<FiSend />}
              className="!bg-amber-500 hover:!bg-amber-600 !border-amber-500 hover:!border-amber-600 !mt-1 self-start"
            >
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </DashboardSection>
  );
}

// ─── My Reviews Tab ────────────────────────────────────────────────────────────

function MyReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await reviewService.getMyReviews();
        setReviews(listData(res));
      } catch (err) {
        message.error(apiMessage(err, "Failed to load your reviews."));
      } finally {
        setLoading(false);
      }
    };
    void loadReviews();
  }, []);

  return (
    <DashboardSection
      title="My Reviews"
      subtitle="Here are the reviews you have shared with us past times."
    >
      {loading ? (
        <div className="grid place-items-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={reviews}
          renderItem={(item) => (
            <List.Item>
              <Card className="shadow-sm border border-slate-200">
                <Rate disabled value={item.rating} className="!text-sm mb-2" />
                <p className="text-slate-700 italic">"{item.comment}"</p>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: "You haven't written any reviews yet." }}
        />
      )}
    </DashboardSection>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const tabItems = [
  {
    key: "part-requests",
    label: (
      <span className="flex items-center gap-2 font-semibold">
        <FiTool size={14} />
        Part Requests
      </span>
    ),
    children: <PartRequestTab />,
  },
  {
    key: "review",
    label: (
      <span className="flex items-center gap-2 font-semibold">
        <FiStar size={14} />
        Write a Review
      </span>
    ),
    children: <ReviewTab />,
  },
  {
    key: "my-reviews",
    label: (
      <span className="flex items-center gap-2 font-semibold">
        <FiList size={14} />
        My Reviews
      </span>
    ),
    children: <MyReviewsTab />,
  },
];

function CustomerFeedback() {
  return (
    <div className="flex flex-col gap-0">
      <Tabs
        defaultActiveKey="part-requests"
        items={tabItems}
        size="large"
        className="[&_.ant-tabs-nav]:!mb-4 [&_.ant-tabs-tab]:!px-4 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-teal-600 [&_.ant-tabs-ink-bar]:!bg-teal-600"
      />
    </div>
  );
}

export default CustomerFeedback;
