"use client";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CAMPAIGN_CATEGORIES,
  CAMPAIGN_LANGUAGES,
  CATEGORY_COLORS,
  AD_TYPE_COLORS,
  CampaignCategory,
  CampaignLanguage,
  getLanguageSelectedColor,
} from "@/types/campaign";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ChannelPricing } from "@/types/channel";
import { toast } from "@/components/shared/Toast";
import { buildCampaignUrl } from "@/lib/navigation";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from "react";
import { useTelegram } from "@/contexts/TelegramContext";
import { useQueryClient } from "@tanstack/react-query";

const campaignSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    budgetMin: z.coerce.number().min(1, "Minimum budget must be at least $1"),
    budgetMax: z.coerce.number().min(1, "Maximum budget must be at least $1"),
    category: z
      .enum(CAMPAIGN_CATEGORIES as [CampaignCategory, ...CampaignCategory[]])
      .optional(),
    minSubscribers: z.coerce.number().min(0).optional(),
    minPostViews: z.coerce.number().min(0).optional(),
    minStoryViews: z.coerce.number().min(0).optional(),
    adTypes: z
      .array(z.enum(["post", "story", "postWithForward"]))
      .min(1, "Select at least one ad type"),
    languages: z.array(z.string()).optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

type CampaignFormData = z.infer<typeof campaignSchema>;

const adTypeOptions: {
  value: keyof ChannelPricing;
  label: string;
  icon: string;
}[] = [
  { value: "post", label: "Post", icon: "ri-file-text-line" },
  { value: "story", label: "Story", icon: "ri-slideshow-line" },
  {
    value: "postWithForward",
    label: "Post + Forward",
    icon: "ri-share-forward-line",
  },
];

const inputStyles =
  "h-10 bg-[hsl(var(--card-bg))] border-white/10 text-foreground placeholder:text-foreground-muted/50 rounded focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none transition-colors duration-200";

const textareaStyles =
  "bg-[hsl(var(--card-bg))] border-white/10 text-foreground placeholder:text-foreground-muted/50 rounded focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none resize-none min-h-[100px] py-2 transition-colors duration-200";

export default function CreateCampaign() {
  const router = useRouter();
  const { telegram } = useTelegram();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDocumentTitle("Create Campaign");

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      budgetMin: 100,
      budgetMax: 500,
      category: undefined,
      minSubscribers: undefined,
      minPostViews: undefined,
      minStoryViews: undefined,
      adTypes: ["post"],
      languages: [],
    },
  });

  const selectedAdTypes = useWatch({
    control: form.control,
    name: "adTypes",
  });

  const selectedLanguages =
    useWatch({
      control: form.control,
      name: "languages",
    }) || [];

  const toggleAdType = (value: "post" | "story" | "postWithForward") => {
    const current = form.getValues("adTypes");
    if (current.includes(value)) {
      if (current.length > 1) {
        form.setValue(
          "adTypes",
          current.filter((t) => t !== value),
          { shouldValidate: true },
        );
      }
    } else {
      form.setValue("adTypes", [...current, value], { shouldValidate: true });
    }
  };

  const toggleLanguage = (lang: string) => {
    const current = form.getValues("languages") || [];
    if (current.includes(lang)) {
      form.setValue(
        "languages",
        current.filter((l) => l !== lang),
      );
    } else {
      form.setValue("languages", [...current, lang]);
    }
  };

  const onSubmit = async (campaignData: CampaignFormData) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...campaignData }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      // Invalidate profile cache data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Campaign created", {
        description: `"${campaignData.title}" is now live and accepting applications.`,
      });
      router.push(buildCampaignUrl(data.campaignId));
    } catch (err: any) {
      toast.error("Error creating campaign");
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-card-bg hover:bg-card-hover transition-colors"
            aria-label="Go back"
          >
            <i
              className="ri-arrow-left-line text-lg text-foreground"
              aria-hidden="true"
            />
          </button>
          <h1 className="text-xl font-bold text-foreground">Create Campaign</h1>
        </div>
      </header>

      <main className="px-4 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="card-surface p-4 space-y-4">
              <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Basic Info
              </h2>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground-muted flex items-center gap-1">
                      Campaign Title
                      <span className="text-status-error text-xs">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SaaS Product Launch"
                        className={inputStyles}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground-muted flex items-center gap-1">
                      Description
                      <span className="text-status-error text-xs">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign goals and requirements..."
                        className={textareaStyles}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground-muted flex items-center gap-1">
                      Category
                      <span className="text-foreground-muted/50 text-[10px] font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange(undefined)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                          field.value === undefined
                            ? "bg-white/10 border-white/30 text-foreground"
                            : "bg-[hsl(var(--card-bg))] border-white/10 text-foreground-muted hover:border-white/20"
                        }`}
                      >
                        Any
                      </button>
                      {CAMPAIGN_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => field.onChange(cat)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                            field.value === cat
                              ? CATEGORY_COLORS[cat]
                              : "bg-[hsl(var(--card-bg))] border-white/10 text-foreground-muted hover:border-white/20"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Languages */}
            <div className="card-surface p-4 space-y-4">
              <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                Target Languages
                <span className="text-[9px] font-normal text-foreground-muted/50 normal-case">
                  (optional)
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                      selectedLanguages.includes(lang)
                        ? getLanguageSelectedColor(lang)
                        : "bg-[hsl(var(--card-bg))] border-white/10 text-foreground-muted hover:border-white/20"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="card-surface p-4 space-y-4">
              <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1">
                Budget Range
                <span className="text-status-error text-xs">*</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground-muted">
                        Minimum ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className={inputStyles}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground-muted">
                        Maximum ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className={inputStyles}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ad Types */}
            <div className="card-surface p-4 space-y-4">
              <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1">
                Accepted Ad Types
                <span className="text-status-error text-xs">*</span>
              </h2>

              <FormField
                control={form.control}
                name="adTypes"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-3 gap-2">
                      {adTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleAdType(option.value)}
                          className={`aspect-square rounded-md flex flex-col items-center justify-center gap-1 transition-all border ${
                            selectedAdTypes.includes(option.value)
                              ? AD_TYPE_COLORS[option.value]
                              : "bg-[hsl(var(--card-bg))] border-white/10 text-foreground-muted hover:border-white/20"
                          }`}
                        >
                          <i className={`${option.icon} text-lg`} />
                          <span className="text-[10px] font-medium">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Requirements */}
            <div className="card-surface p-4">
              <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                Channel Requirements
                <span className="text-[9px] font-normal text-foreground-muted/50 normal-case">
                  (optional)
                </span>
              </h2>
              <p className="text-[10px] text-foreground-muted mt-1">
                Filters for eligible channels
              </p>

              {/* Subscribers */}
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="minSubscribers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground-muted flex items-center gap-1">
                        <i className="ri-group-line" />
                        Min. Subscribers
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g., 1000"
                          className={inputStyles}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Post Views - only show if post or postWithForward selected */}
              <div
                className={`grid transition-all duration-300 ease-out ${
                  selectedAdTypes.includes("post") ||
                  selectedAdTypes.includes("postWithForward")
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <FormField
                    control={form.control}
                    name="minPostViews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground-muted flex items-center gap-1">
                          <i className="ri-eye-line" />
                          Min. Avg. Post Views
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g., 5000"
                            className={inputStyles}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Story Views - only show if story selected */}
              <div
                className={`grid transition-all duration-300 ease-out ${
                  selectedAdTypes.includes("story")
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <FormField
                    control={form.control}
                    name="minStoryViews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground-muted flex items-center gap-1">
                          <i className="ri-slideshow-line" />
                          Min. Avg. Story Views
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g., 3000"
                            className={inputStyles}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full h-12 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Campaign"
              )}
            </button>
          </form>
        </Form>
      </main>
    </div>
  );
}
