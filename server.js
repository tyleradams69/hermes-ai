import "dotenv/config";
import { supabase } from "./supabase-client.js";
import express from "express";
import cors from "cors";

import {
  reviewFollowups
} from "./followup-review.js";

import {
  readActivity,
  logActivity
} from "./activity-log.js";

import {
  ingestReply
} from "./reply-ingestion.js";

import {
  processInboundWebhook
} from "./inbound-webhook.js";

import {
  getAllLeads,
  getLeadByCompany
} from "./lead-store.js";

import { scoreLead } from "./lead-intelligence.js";
import { generateFollowup } from "./ai-followup-generator.js";
import { sendFollowupEmail } from "./resend-sender.js";
import { classifyReply } from "./ai-reply-classifier.js";
import { updateLeadMemory } from "./lead-memory.js";
import { extractStrategyMemory } from "./strategy-engine.js";
import { deriveOutcomeStrategies } from "./strategy-outcome-engine.js";
import { loadRelevantStrategies } from "./strategy-memory-loader.js";
import { applyStrategyAdjustments } from "./strategy-score-adjuster.js";
import { buildWebsiteLead } from "./website-intake.js";
import { generatePredictiveInsights } from "./predictive-engine.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3002;

// GET OPERATOR OUTCOME CORRELATIONS
app.get("/api/operator-correlations", async (req, res) => {
  try {
    const businessId =
      req.query.business_id || "liminull";

    const { data, error } = await supabase
      .from("operator_outcome_correlations")
      .select("*")
      .eq("business_id", businessId)
      .order("confidence", { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load operator correlations",
      });
    }

    return res.json({
      ok: true,
      correlations: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load operator correlations",
    });
  }
});


// GENERATE OPERATOR OUTCOME CORRELATIONS
app.post("/api/operator-correlations/generate", async (req, res) => {
  try {
    const {
      business_id = "liminull",
    } = req.body;

    const actionsResult =
      await supabase
        .from("operator_actions")
        .select("*")
        .eq("business_id", business_id)
        .order("created_at", { ascending: false })
        .limit(100);

    const outcomesResult =
      await supabase
        .from("workflow_outcomes")
        .select("*")
        .eq("business_id", business_id)
        .order("created_at", { ascending: false })
        .limit(100);

    if (actionsResult.error || outcomesResult.error) {
      console.error(actionsResult.error || outcomesResult.error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load correlation data",
      });
    }

    const actions =
      actionsResult.data || [];

    const outcomes =
      outcomesResult.data || [];

    const fastAcknowledgments =
      actions.filter(
        (action) =>
          action.action_type === "predictive_signal_acknowledged" &&
          (action.response_latency_seconds || 0) > 0 &&
          (action.response_latency_seconds || 0) <= 300
      );

    const successfulOutcomes =
      outcomes.filter(
        (outcome) => outcome.success === true
      );

    const correlations = [];

    if (
      fastAcknowledgments.length > 0 &&
      successfulOutcomes.length > 0
    ) {
      correlations.push({
        business_id,
        correlation_type: "fast_operator_response",
        observation:
          "Fast predictive signal acknowledgments are appearing alongside successful workflow outcomes.",
        impact_summary:
          "Rapid operator response may help preserve momentum on high-intent opportunities.",
        confidence:
          Math.min(
            95,
            55 + fastAcknowledgments.length * 8
          ),
        supporting_events:
          fastAcknowledgments.length + successfulOutcomes.length,
        updated_at: new Date().toISOString(),
      });
    }

    const onboardingSuccesses =
      outcomes.filter(
        (outcome) =>
          outcome.success === true &&
          (outcome.notes || "")
            .toLowerCase()
            .includes("onboarding")
      );

    if (onboardingSuccesses.length > 0) {
      correlations.push({
        business_id,
        correlation_type: "onboarding_reassurance_success",
        observation:
          "Successful outcomes are connected to clarification around onboarding or implementation support.",
        impact_summary:
          "Direct reassurance around onboarding support appears to improve conversion momentum.",
        confidence:
          Math.min(
            95,
            60 + onboardingSuccesses.length * 10
          ),
        supporting_events:
          onboardingSuccesses.length,
        updated_at: new Date().toISOString(),
      });
    }

    if (correlations.length > 0) {
      await supabase
        .from("operator_outcome_correlations")
        .upsert(
          correlations,
          {
            onConflict: "business_id,correlation_type",
          }
        );
    }

    return res.json({
      ok: true,
      correlations,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to generate operator correlations",
    });
  }
});


// GET OPERATOR ACTION SUMMARY
app.get("/api/operator-actions-summary", async (req, res) => {
  try {
    const businessId =
      req.query.business_id || "liminull";

    const { data, error } = await supabase
      .from("operator_actions")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load operator action summary",
      });
    }

    const actions = data || [];

    const totalActions =
      actions.length;

    const predictiveAckActions =
      actions.filter(
        (action) =>
          action.action_type === "predictive_signal_acknowledged"
      );

    const latencies =
      predictiveAckActions
        .map((action) => action.response_latency_seconds || 0)
        .filter((value) => value > 0);

    const avgResponseSeconds =
      latencies.length > 0
        ? Math.round(
            latencies.reduce((sum, value) => sum + value, 0) /
              latencies.length
          )
        : 0;

    const fastResponses =
      latencies.filter((value) => value <= 300).length;

    const fastResponseRate =
      latencies.length > 0
        ? Math.round((fastResponses / latencies.length) * 100)
        : 0;

    let operationalInsight =
      "Operator performance intelligence is collecting response behavior.";

    if (avgResponseSeconds > 0 && avgResponseSeconds <= 300) {
      operationalInsight =
        "Operator response speed is strong. Fast acknowledgment behavior may support higher conversion momentum.";
    } else if (avgResponseSeconds > 900) {
      operationalInsight =
        "Operator response latency is elevated. Hermes should continue escalating high-probability opportunities sooner.";
    }

    return res.json({
      ok: true,
      summary: {
        total_actions: totalActions,
        predictive_ack_count: predictiveAckActions.length,
        avg_response_seconds: avgResponseSeconds,
        fast_response_rate: fastResponseRate,
        operational_insight: operationalInsight,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load operator action summary",
    });
  }
});


// RECORD OPERATOR ACTION
app.post("/api/operator-actions", async (req, res) => {
  try {
    const {
      business_id = "liminull",
      company,
      operator_name = "operator",
      action_type,
      action_target,
      action_details,
      response_latency_seconds = 0,
    } = req.body;

    if (!company || !action_type) {
      return res.status(400).json({
        ok: false,
        error: "company and action_type are required",
      });
    }

    const { data, error } = await supabase
      .from("operator_actions")
      .insert([
        {
          business_id,
          company,
          operator_name,
          action_type,
          action_target,
          action_details,
          response_latency_seconds,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to record operator action",
      });
    }

    await supabase.from("activities").insert([
      {
        business_id,
        type: "operator_action_recorded",
        company,
        message: `Operator action recorded: ${action_type}`,
        payload: data,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      action: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Operator action logging failed",
    });
  }
});


// ACKNOWLEDGE PREDICTIVE SIGNAL
app.post("/api/predictive-acknowledgments", async (req, res) => {
  try {
    const {
      business_id = "liminull",
      company,
      signal_type,
      insight_signature = "",
      acknowledged_by = "operator",
    } = req.body;

    if (!company || !signal_type) {
      return res.status(400).json({
        ok: false,
        error: "company and signal_type are required",
      });
    }

    const { data, error } = await supabase
      .from("predictive_acknowledgments")
      .upsert(
        {
          business_id,
          company,
          signal_type,
          insight_signature,
          acknowledged_by,
          acknowledged_at: new Date().toISOString(),
        },
        {
          onConflict: "business_id,company,signal_type",
        }
      )
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to acknowledge predictive signal",
      });
    }

    await supabase.from("activities").insert([
      {
        business_id,
        type: "predictive_signal_acknowledged",
        company,
        message: `Predictive signal acknowledged: ${signal_type}`,
        payload: data,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      acknowledgment: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Predictive acknowledgment failed",
    });
  }
});

// GET PREDICTIVE ACKNOWLEDGMENTS
app.get("/api/predictive-acknowledgments", async (req, res) => {
  try {
    const businessId =
      req.query.business_id || "liminull";

    const { data, error } = await supabase
      .from("predictive_acknowledgments")
      .select("*")
      .eq("business_id", businessId);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load predictive acknowledgments",
      });
    }

    return res.json({
      ok: true,
      acknowledgments: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load predictive acknowledgments",
    });
  }
});


// GET PREDICTIVE INSIGHTS FOR LEAD
app.get("/api/predictive-insights/:company", async (req, res) => {
  try {
    const company = req.params.company;

    const businessId =
      req.query.business_id || "liminull";

    const { data, error } = await supabase
      .from("predictive_insights")
      .select("*")
      .eq("company", company)
      .eq("business_id", businessId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load predictive insights",
      });
    }

    return res.json({
      ok: true,
      insight: data || null,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load predictive insights",
    });
  }
});


// WEBSITE INQUIRY INTAKE
app.post("/api/website-inquiry", async (req, res) => {
  try {
    const {
      company,
      email,
      phone,
      website,
      message,
      business_id = "liminull",
    } = req.body;

    if (!company || !email) {
      return res.status(400).json({
        ok: false,
        error: "company and email are required",
      });
    }

    const lead =
      buildWebsiteLead({
        company,
        email,
        phone,
        website,
        message,
        business_id,
      });

    const { data, error } = await supabase
      .from("leads")
      .upsert(
        {
          ...lead,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "company",
        }
      )
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to create website lead",
      });
    }

    await supabase.from("activities").insert([
      {
        type: "website_inquiry_received",
        company,
        business_id,
        message: `Website inquiry received from ${company}`,
        payload: data,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      lead: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Website inquiry intake failed",
    });
  }
});


// GET STRATEGY MEMORY
app.get("/api/strategy-memory", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("strategy_memory")
      .select("*")
      .eq("business_id", req.query.business_id || "liminull")
      .order("adaptive_confidence", {
        ascending: false,
      })
      .limit(25);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load strategy memory",
      });
    }

    return res.json({
      ok: true,
      strategies: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load strategy memory",
    });
  }
});


// RECORD WORKFLOW OUTCOME
app.post("/api/workflow-outcomes", async (req, res) => {
  try {
    const {
      company,
      action_type,
      action_summary,
      outcome,
      success,
      lead_stage,
      lead_score,
      notes,
    } = req.body;

    if (!company || !action_type || !outcome) {
      return res.status(400).json({
        ok: false,
        error: "company, action_type, and outcome are required",
      });
    }

    const { data, error } = await supabase
      .from("workflow_outcomes")
      .insert([
        {
          company,
          action_type,
          action_summary,
          outcome,
          success: Boolean(success),
          lead_stage,
          lead_score,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to record workflow outcome",
      });
    }

    const outcomeStrategies =
      deriveOutcomeStrategies({
        outcome: data,
      });

    if (outcomeStrategies.length > 0) {
      await supabase
        .from("strategy_memory")
        .upsert(outcomeStrategies, {
          onConflict: "category",
        });

      for (const strategy of outcomeStrategies) {
        const { data: existing } = await supabase
          .from("strategy_memory")
          .select("*")
          .eq("category", strategy.category)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          const successCount =
            (existing.success_count || 0) + (success ? 1 : 0);

          const failureCount =
            (existing.failure_count || 0) + (!success ? 1 : 0);

          const usageCount =
            (existing.usage_count || 0) + 1;

          const adaptiveConfidence =
            Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  ((successCount + 1) / (usageCount + 2)) * 100
                )
              )
            );

          await supabase
            .from("strategy_memory")
            .update({
              success_count: successCount,
              failure_count: failureCount,
              usage_count: usageCount,
              adaptive_confidence: adaptiveConfidence,
            })
            .eq("id", existing.id);
        }
      }
    }

    await supabase.from("activities").insert([
      {
        type: "workflow_outcome_recorded",
        company,
        message: `Workflow outcome recorded: ${outcome}`,
        payload: data,
        created_at: new Date().toISOString(),
      },
      {
        type: "strategy_memory_updated",
        company,
        message: `Strategy memory updated from outcome: ${outcome}`,
        payload: outcomeStrategies,
        business_id: "liminull",
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      outcome: data,
      outcomeStrategies,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to record workflow outcome",
    });
  }
});


// GET LEAD MEMORY
app.get("/api/lead/:company/memory", async (req, res) => {
  try {
    const company = req.params.company;

    const { data, error } = await supabase
      .from("lead_memory")
      .select("*")
      .eq("company", company)
      .eq("business_id", req.query.business_id || "liminull")
      .maybeSingle();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load lead memory",
      });
    }

    return res.json({
      ok: true,
      memory: data || null,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load lead memory",
    });
  }
});


// RESEND INBOUND REPLY WEBHOOK
app.post("/api/inbound/resend", async (req, res) => {
  try {
    const payload = req.body;

    const fromEmail =
      payload?.from ||
      payload?.sender ||
      payload?.email?.from ||
      "";

    const subject =
      payload?.subject ||
      payload?.email?.subject ||
      "";

    const body =
      payload?.text ||
      payload?.html ||
      payload?.email?.text ||
      payload?.email?.html ||
      "";

    const company =
      payload?.company ||
      payload?.tags?.company ||
      "";

    const businessId =
      payload?.business_id ||
      "liminull";

    const { data, error } = await supabase
      .from("inbound_replies")
      .insert([
        {
          company,
          from_email: fromEmail,
          subject,
          body,
          raw_payload: payload,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to store inbound reply",
      });
    }

    const classification =
      await classifyReply(data);

    const leadResult =
      await supabase
        .from("leads")
        .select("*")
        .eq("company", company)
        .maybeSingle();

    let updatedLead = null;

    if (leadResult.data) {
      const baseIntelligence =
        scoreLead({
          ...leadResult.data,
          latest_reply: body,
          reply_status: classification.intent,
          pipeline_stage: classification.suggested_stage,
        });

      const existingMemoryResult =
        await supabase
          .from("lead_memory")
          .select("*")
          .eq("company", company)
          .maybeSingle();

      const strategyResult =
        await supabase
          .from("strategy_memory")
          .select("*")
          .order("adaptive_confidence", {
            ascending: false,
          })
          .limit(8);

      const adjustedScore =
        applyStrategyAdjustments({
          score:
            baseIntelligence.lead_score,

          memory:
            existingMemoryResult.data || null,

          strategies:
            strategyResult.data || [],
        });

      let adjustedTemperature = "warm";

      if (adjustedScore >= 80) {
        adjustedTemperature = "hot";
      } else if (adjustedScore <= 35) {
        adjustedTemperature = "cold";
      }

      let adjustedPriority = "normal";

      if (adjustedScore >= 85) {
        adjustedPriority = "critical";
      } else if (adjustedScore >= 70) {
        adjustedPriority = "high";
      } else if (adjustedScore <= 30) {
        adjustedPriority = "low";
      }

      const updateResult =
        await supabase
          .from("leads")
          .update({
            latest_reply: body,
            reply_status: classification.intent,
            pipeline_stage: classification.suggested_stage,
            lead_score: adjustedScore,
            lead_temperature: adjustedTemperature,
            lead_priority: adjustedPriority,
            ai_reasoning:
              classification.reasoning || baseIntelligence.ai_reasoning,
            suggested_next_action:
              classification.suggested_next_action || "",
            updated_at: new Date().toISOString(),
          })
          .eq("company", company)
          .select()
          .single();

      updatedLead = updateResult.data;
    }

    let autoApproval = null;

    const shouldGenerateFollowup =
      classification.suggested_next_action &&
      (
        classification.suggested_next_action.toLowerCase().includes("followup") ||
        classification.suggested_next_action.toLowerCase().includes("pricing") ||
        classification.suggested_next_action.toLowerCase().includes("scheduler") ||
        classification.suggested_next_action.toLowerCase().includes("meeting") ||
        classification.suggested_next_action.toLowerCase().includes("call") ||
        classification.suggested_next_action.toLowerCase().includes("sales call") ||
        classification.suggested_next_action.toLowerCase().includes("onboarding") ||
        classification.suggested_next_action.toLowerCase().includes("implementation")
      );

    if (updatedLead && shouldGenerateFollowup) {
      const memoryResult =
        await supabase
          .from("lead_memory")
          .select("*")
          .eq("company", company)
          .maybeSingle();

      const relevantStrategies =
        await loadRelevantStrategies({
          lead: {
            ...updatedLead,
            memory:
              memoryResult.data || null,
          },
          classification,
        });

      const followup =
        await generateFollowup({
          ...updatedLead,
          latest_reply: body,
          memory:
            memoryResult.data || null,
          strategies:
            relevantStrategies,
        });

      const approvalResult =
        await supabase
          .from("followup_approvals")
          .insert([
            {
              company,
              subject: followup.subject,
              body: followup.body,
              reasoning:
                followup.reasoning ||
                classification.reasoning,
              status: "pending",
            },
          ])
          .select()
          .single();

      autoApproval =
        approvalResult.data;
    }

    let memory = null;

    if (updatedLead) {
      memory =
        await updateLeadMemory({
          lead: updatedLead,
          reply: data,
          classification,
        });

      await supabase
        .from("lead_memory")
        .upsert(
          {
            company,
            summary: memory.summary,
            current_intent: memory.current_intent,
            objections: memory.objections,
            relationship_status: memory.relationship_status,
            recommended_next_action: memory.recommended_next_action,
            risk_level: memory.risk_level,
            opportunity_notes: memory.opportunity_notes,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "company",
          }
        );
    }

    let strategyMemories = [];

    if (updatedLead && memory) {
      strategyMemories =
        extractStrategyMemory({
          classification,
          memory,
          lead: updatedLead,
        });

      if (strategyMemories.length > 0) {
        await supabase
          .from("strategy_memory")
          .upsert(strategyMemories, {
            onConflict: "category",
          });
      }
    }

    let predictiveInsights = null;

    if (updatedLead && memory) {
      const strategyResult =
        await supabase
          .from("strategy_memory")
          .select("*")
          .eq("business_id", businessId || "liminull")
          .order("adaptive_confidence", {
            ascending: false,
          })
          .limit(8);

      predictiveInsights =
        generatePredictiveInsights({
          lead: updatedLead,
          memory,
          strategies: strategyResult.data || [],
        });

      await supabase
        .from("predictive_insights")
        .upsert(
          {
            business_id: businessId || "liminull",
            company,
            ...predictiveInsights,
            insight_signature:
              predictiveInsights.insight_signature || "",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "company",
          }
        );
    }

    const activityEvents = [
      {
        type: "inbound_reply_received",
        company: company || fromEmail || "unknown",
        message: `Inbound reply received from ${fromEmail || "unknown sender"}`,
        payload: data,
        created_at: new Date().toISOString(),
      },
      {
        type: "reply_classified",
        company: company || fromEmail || "unknown",
        message: `Reply classified as ${classification.intent}`,
        payload: classification,
        business_id: "liminull",
        created_at: new Date().toISOString(),
      },
      {
        type: "lead_updated_from_reply",
        company: company || fromEmail || "unknown",
        message: `Lead updated from inbound reply: ${classification.suggested_stage}`,
        payload: updatedLead,
        business_id: "liminull",
        created_at: new Date().toISOString(),
      },
    ];

    if (autoApproval) {
      activityEvents.push({
        type: "auto_followup_queued",
        company,
        message: `Hermes auto-generated a followup proposal for ${company}`,
        payload: autoApproval,
        business_id: "liminull",
        created_at: new Date().toISOString(),
      });
    }

    await supabase
      .from("activities")
      .insert(activityEvents);

    return res.json({
      ok: true,
      reply: data,
      classification,
      lead: updatedLead,
      autoApproval,
      memory,
      strategyMemories,
      predictiveInsights,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Inbound webhook failed",
    });
  }
});


// UPDATE FOLLOWUP APPROVAL STATUS
app.post("/api/followup-approvals/:id/status", async (req, res) => {
  try {
    const id = req.params.id;

    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid status",
      });
    }

    const existingApproval =
      await supabase
        .from("followup_approvals")
        .select("*")
        .eq("id", id)
        .single();

    const approval =
      existingApproval.data;

    if (
      status === "approved"
    ) {

      const leadResult =
        await supabase
          .from("leads")
          .select("*")
          .eq("company", approval.company)
          .single();

      const lead =
        leadResult.data;

      if (
        lead?.email
      ) {

        await sendFollowupEmail({
          to: lead.email,

          subject:
            approval.subject,

          body:
            approval.body,
        });
      }
    }

    const { data, error } = await supabase
      .from("followup_approvals")
      .update({
        status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to update approval",
      });
    }

    await supabase.from("activities").insert([
      {
        type: `followup_${status}`,
        company: data.company,
        message: `Followup ${status} for ${data.company}`,
        payload: data,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      approval: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to update approval",
    });
  }
});


// GET FOLLOWUP APPROVALS
app.get("/api/followup-approvals", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("followup_approvals")
      .select("*")
      .eq("status", "pending")
      .eq("business_id", req.query.business_id || "liminull")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load followup approvals",
      });
    }

    return res.json({
      ok: true,
      approvals: data || [],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load followup approvals",
    });
  }
});


// GENERATE AI FOLLOWUP
app.post("/api/lead/:company/generate-followup", async (req, res) => {
  try {
    const company = req.params.company;

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("company", company)
      .single();

    if (error || !lead) {
      return res.status(404).json({
        ok: false,
        error: "Lead not found",
      });
    }

    const followup = await generateFollowup(lead);

    const { data: approval, error: approvalError } = await supabase
      .from("followup_approvals")
      .insert([
        {
          company,
          subject: followup.subject,
          body: followup.body,
          reasoning: followup.reasoning,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (approvalError) {
      console.error(approvalError);

      return res.status(500).json({
        ok: false,
        error: "Failed to save followup approval",
      });
    }

    await supabase.from("activities").insert([
      {
        type: "ai_followup_queued",
        company,
        message: `AI followup queued for approval: ${company}`,
        payload: approval,
        business_id: "liminull",
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      followup,
      approval,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to generate followup",
    });
  }
});


// HEALTH CHECK
app.get("/", (req, res) => {

  res.json({
    status: "Hermes API online"
  });
});

// GET ALL LEADS STATE
app.get("/api/state", async (req, res) => {

  const businessId =
    req.query.business_id || "liminull";

  const state =
    await getAllLeads(businessId);

  res.json(state);
});

// UPDATE LEAD PIPELINE STAGE
app.post("/api/lead/:company/stage", async (req, res) => {
  try {
    const company = req.params.company;
    const { pipeline_stage } = req.body;

    if (!company || !pipeline_stage) {
      return res.status(400).json({
        ok: false,
        error: "Company and pipeline_stage are required",
      });
    }

    const { data: existingLead } = await supabase
      .from("leads")
      .select("*")
      .eq("company", company)
      .single();

    const intelligence = scoreLead({
      ...(existingLead || {}),
      pipeline_stage,
    });

    const { data, error } = await supabase
      .from("leads")
      .update({
        pipeline_stage,
        updated_at: new Date().toISOString(),
        lead_score: intelligence.lead_score,
        lead_temperature: intelligence.lead_temperature,
        lead_priority: intelligence.lead_priority,
        ai_reasoning: intelligence.ai_reasoning,
      })
      .eq("company", company)
      .select();

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: error.message,
      });
    }

    await supabase.from("activities").insert([
      {
        type: "pipeline_stage_updated",
        company,
        message: `Pipeline stage updated to ${pipeline_stage}`,
        payload: {
          company,
          pipeline_stage,
        },
        business_id: "liminull",
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({
      ok: true,
      lead: data?.[0] || null,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to update pipeline stage",
    });
  }
});

// MANUAL LEAD IMPORT
app.post("/api/leads/import", async (req, res) => {

  try {

    const {
      company,
      email,
      phone,
      website
    } = req.body;

    if (!company) {

      return res.status(400).json({
        ok: false,
        error: "Company required"
      });
    }

    const newLead = {

      company,

      email: email || "",

      phone: phone || "",

      website: website || "",

      status: "new",

      pipeline_stage: "new_lead",

      reply_status: "",

      latest_reply: "",

      followup_count: 0,

      business_id: "liminull",
        created_at: new Date().toISOString(),

      updated_at: new Date().toISOString()
    };

    const intelligence =
      scoreLead(newLead);

    Object.assign(
      newLead,
      intelligence
    );

    const { data, error } =
      await supabase
        .from("leads")
        .insert([newLead])
        .select();

    if (error) {

      console.error(error);

      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }

    await supabase
      .from("activities")
      .insert([{

        type: "lead_imported",

        company,

        message: `Lead manually imported: ${company}`,

        payload: newLead,

        created_at: new Date().toISOString()
      }]);

    res.json({
      ok: true,
      lead: data[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Import failed"
    });
  }
});

// GET SINGLE COMPANY STATE
app.get("/api/state/:company", async (req, res) => {

  const company =
    req.params.company;

  const state =
    await getLeadByCompany(company);

  res.json(state || {});
});

// GET FOLLOWUP REVIEW
app.get("/api/followups", (req, res) => {

  const review =
    reviewFollowups();

  res.json(review);
});

// GET ACTIVITY FEED
app.get("/api/activity", async (req, res) => {

  const activity =
    await readActivity();

  res.json({
    activity
  });
});

// GET COMPANY ACTIVITY
app.get("/api/activity/:company", async (req, res) => {

  const company =
    req.params.company;

  const activity =
    await readActivity();

  const filtered =
    activity.filter(
      (event) =>
        event.company === company
    );

  res.json({
    activity: filtered
  });
});

// TEST ACTIVITY EVENT
app.post("/api/test-activity", async (req, res) => {

  const event =
    await logActivity({
      type: "test_event",
      company: "Hermes System",
      message: "Activity logging operational"
    });

  res.json({
    success: true,
    event
  });
});

// TEST INBOUND REPLY
app.post("/api/replies/ingest", async (req, res) => {

  const result =
    await ingestReply(req.body);

  res.json(result);
});

// INBOUND EMAIL WEBHOOK
app.post("/api/inbound-webhook", async (req, res) => {

  const result =
    await processInboundWebhook(req.body);

  res.json(result);
});

// APPROVE LEAD
app.post("/api/lead/:company/approve", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "lead_approved",
      company,
      message:
        `${company} approved for outreach`
    });

  res.json({
    success: true,
    company,
    action: "approved",
    event
  });
});

// REJECT LEAD
app.post("/api/lead/:company/reject", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "lead_rejected",
      company,
      message:
        `${company} rejected from outbound queue`
    });

  res.json({
    success: true,
    company,
    action: "rejected",
    event
  });
});

// SEND OUTREACH
app.post("/api/lead/:company/send", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "outreach_sent",
      company,
      message:
        `Outreach send triggered for ${company}`
    });

  res.json({
    success: true,
    company,
    action: "send_triggered",
    event
  });
});

// GENERATE FOLLOW-UP
app.post("/api/lead/:company/followup", async (req, res) => {

  const company =
    req.params.company;

  const event =
    await logActivity({
      type: "followup_generated",
      company,
      message:
        `Follow-up generation triggered for ${company}`
    });

  res.json({
    success: true,
    company,
    action: "followup_triggered",
    event
  });
});

// LOCAL DEV SERVER
if (process.env.VERCEL !== "1") {

  app.listen(PORT, () => {

    console.log(
      `Hermes API running on port ${PORT}`
    );
  });
}

// VERCEL EXPORT
export default app;