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
import { applyOperationalOptimizations } from "./operational-optimizer.js";
import { generateWeightAdjustments } from "./runtime-weight-optimizer.js";
import { calibratePredictiveInsights } from "./prediction-calibration.js";
import { extractMemoryAssociations } from "./memory-association-engine.js";
import { applyAssociationReasoning } from "./association-reasoning.js";
import { generateTemporalPatterns } from "./temporal-learning-engine.js";
import { applyTemporalReasoning } from "./temporal-reasoning.js";
import { generateTemporalWindows } from "./temporal-window-engine.js";
import { applyTemporalWindowReasoning } from "./temporal-window-reasoning.js";
import { applyUrgencyDecay } from "./urgency-decay-engine.js";
import { generateInterventionSimulations } from "./intervention-simulation-engine.js";
import { applySimulationPriority } from "./simulation-priority-engine.js";
import { generateInterventionChains } from "./intervention-chain-engine.js";
import { applyChainPriority } from "./chain-priority-engine.js";
import { generateGlobalPatterns } from "./global-intelligence-engine.js";
import { applyGlobalPatternReasoning } from "./global-pattern-reasoning.js";
import { generateGlobalWeightAdjustments } from "./global-weight-adaptation.js";
import { requireBusinessId } from "./business-guard.js";
import { requireApiAuth } from "./api-auth-guard.js";
import { requireRole } from "./role-guard.js";
import { evaluateAutomationSafety } from "./automation-safety.js";
import { createAuditLog } from "./audit-engine.js";
import { createRollbackSnapshot } from "./rollback-engine.js";
import { recordSystemFailure } from "./monitoring-engine.js";
import { generateOperationalHealth } from "./operational-health-engine.js";
import { apiLimiter, automationLimiter } from "./rate-limiters.js";
import { enqueueJob } from "./queue-engine.js";
import { detectWorkerHealth } from "./worker-health-engine.js";
import { generateWorkerRecovery } from "./worker-recovery-engine.js";
import { evaluateSystemMode } from "./degraded-mode-engine.js";
import { enforceSystemMode } from "./system-mode-guard.js";

const app = express();

app.use(apiLimiter);

app.use(cors());
app.use(express.json());


// GET RUNTIME OPTIMIZATION WEIGHTS
app.get("/api/runtime-weights", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("runtime_optimization_weights")
      .select("*")
      .eq("business_id", businessId)
      .order("weight_key", { ascending: true });

    if (error) {
      return res.status(500).json({
        ok: false,
        error: "Failed to load runtime weights",
      });
    }

    return res.json({
      ok: true,
      weights: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load runtime weights",
    });
  }
});



// GET BRAIN TIMELINE EVENTS
app.get("/api/brain-timeline", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({ req, res, allowedRoles: ["admin"] })) {
      return;
    }
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("brain_timeline_events")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load brain timeline",
      });
    }

    return res.json({
      ok: true,
      events: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load brain timeline",
    });
  }
});



// GET BRAIN HEALTH
app.get("/api/brain-health", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({ req, res, allowedRoles: ["admin"] })) {
      return;
    }
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const [
      strategyResult,
      correlationResult,
      weightResult,
      timelineResult,
      actionResult,
    ] = await Promise.all([
      supabase
        .from("strategy_memory")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("operator_outcome_correlations")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("runtime_optimization_weights")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("brain_timeline_events")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("operator_actions")
        .select("*")
        .eq("business_id", businessId),
    ]);

    const strategies =
      strategyResult.data || [];

    const correlations =
      correlationResult.data || [];

    const weights =
      weightResult.data || [];

    const timeline =
      timelineResult.data || [];

    const actions =
      actionResult.data || [];

    const avgStrategyConfidence =
      strategies.length > 0
        ? Math.round(
            strategies.reduce(
              (sum, item) =>
                sum + (item.adaptive_confidence || item.confidence || 50),
              0
            ) / strategies.length
          )
        : 0;

    const avgCorrelationConfidence =
      correlations.length > 0
        ? Math.round(
            correlations.reduce(
              (sum, item) =>
                sum + (item.confidence || 50),
              0
            ) / correlations.length
          )
        : 0;

    const recentMutations =
      timeline.filter(
        (item) =>
          item.event_type === "runtime_weight_adjusted"
      );

    const uniqueMutationKeys =
      new Set(
        recentMutations.map(
          (item) =>
            `${item.event_title}-${item.after_value}`
        )
      );

    const optimizationMomentum =
      uniqueMutationKeys.size;

    const avgWeight =
      weights.length > 0
        ? (
            weights.reduce(
              (sum, item) =>
                sum + Number(item.weight_value || 1),
              0
            ) / weights.length
          ).toFixed(2)
        : "1.00";

    const responseLatencies =
      actions
        .map((item) =>
          item.response_latency_seconds || 0
        )
        .filter((v) => v > 0);

    const avgResponseLatency =
      responseLatencies.length > 0
        ? Math.round(
            responseLatencies.reduce((a, b) => a + b, 0) /
              responseLatencies.length
          )
        : 0;

    const brainHealthScore =
      Math.min(
        100,
        Math.round(
          (avgStrategyConfidence * 0.25) +
          (avgCorrelationConfidence * 0.30) +
          (Math.min(optimizationMomentum, 10) * 4) +
          (Number(avgWeight) * 10) +
          (avgResponseLatency > 0 && avgResponseLatency <= 300 ? 15 : 0)
        )
      );

    let brainState =
      "Dormant";

    if (brainHealthScore >= 90) {
      brainState = "Hyper-Optimizing";
    } else if (brainHealthScore >= 75) {
      brainState = "Evolving";
    } else if (brainHealthScore >= 55) {
      brainState = "Adaptive";
    } else if (brainHealthScore >= 35) {
      brainState = "Learning";
    }

    return res.json({
      ok: true,

      health: {
        brain_state:
          brainState,

        brain_health_score:
          brainHealthScore,

        learning_velocity:
          optimizationMomentum,

        strategy_confidence:
          avgStrategyConfidence,

        correlation_confidence:
          avgCorrelationConfidence,

        optimization_weight_avg:
          avgWeight,

        operator_response_latency:
          avgResponseLatency,

        memory_depth:
          strategies.length,

        evolution_events:
          timeline.length,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load brain health",
    });
  }
});



// GET BRAIN ACTIVITY HEAT
app.get("/api/brain-activity-heat", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({ req, res, allowedRoles: ["admin"] })) {
      return;
    }
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("brain_timeline_events")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load brain activity heat",
      });
    }

    const events = data || [];

    const buckets = {};

    for (const event of events) {
      const date =
        new Date(event.created_at);

      const hourKey =
        `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")} ${String(date.getUTCHours()).padStart(2,"0")}:00`;

      buckets[hourKey] =
        (buckets[hourKey] || 0) + 1;
    }

    const heat =
      Object.entries(buckets)
        .map(([time, intensity]) => ({
          time,
          intensity,
        }))
        .sort((a, b) =>
          a.time.localeCompare(b.time)
        );

    return res.json({
      ok: true,
      heat,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load brain activity heat",
    });
  }
});



// GET PREDICTION DRIFT
app.get("/api/prediction-drift", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("predictive_insights")
      .select("*")
      .eq("business_id", businessId)
      .order("updated_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load prediction drift",
      });
    }

    const drift =
      (data || []).map((item) => ({
        company:
          item.company,

        close_probability:
          item.close_probability,

        recovery_probability:
          item.recovery_probability,

        stale_risk:
          item.stale_risk,

        updated_at:
          item.updated_at,
      }));

    return res.json({
      ok: true,
      drift,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load prediction drift",
    });
  }
});



// GET NEURAL MEMORY DENSITY
app.get("/api/neural-memory-density", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const [
      strategyResult,
      memoryResult,
      correlationResult,
      timelineResult,
    ] = await Promise.all([
      supabase
        .from("strategy_memory")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("lead_memory")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("operator_outcome_correlations")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("brain_timeline_events")
        .select("*")
        .eq("business_id", businessId),
    ]);

    const strategies =
      strategyResult.data || [];

    const memories =
      memoryResult.data || [];

    const correlations =
      correlationResult.data || [];

    const timeline =
      timelineResult.data || [];

    const density =
      (
        strategies.length * 2 +
        memories.length * 1.5 +
        correlations.length * 3 +
        timeline.length
      );

    return res.json({
      ok: true,

      density: {
        neural_density:
          density,

        strategies:
          strategies.length,

        memories:
          memories.length,

        correlations:
          correlations.length,

        mutations:
          timeline.length,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load neural density",
    });
  }
});



// GET BRAIN CONSCIOUSNESS INDEX
app.get("/api/brain-consciousness", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({ req, res, allowedRoles: ["admin"] })) {
      return;
    }
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const [healthRes, densityRes, heatRes] =
      await Promise.all([
        fetch(`http://localhost:3002/api/brain-health?business_id=${businessId}`),
        fetch(`http://localhost:3002/api/neural-memory-density?business_id=${businessId}`),
        fetch(`http://localhost:3002/api/brain-activity-heat?business_id=${businessId}`),
      ]);

    const healthData = await healthRes.json();
    const densityData = await densityRes.json();
    const heatData = await heatRes.json();

    const health =
      healthData.health || {};

    const density =
      densityData.density || {};

    const heat =
      heatData.heat || [];

    const recentHeat =
      heat.reduce(
        (sum, item) => sum + (item.intensity || 0),
        0
      );

    const consciousnessIndex =
      Math.min(
        100,
        Math.round(
          (health.brain_health_score || 0) * 0.45 +
          Math.min(density.neural_density || 0, 50) * 0.7 +
          Math.min(recentHeat, 20) * 1.0
        )
      );

    let consciousnessState =
      "Dormant";

    if (consciousnessIndex >= 90) {
      consciousnessState = "Highly Aware";
    } else if (consciousnessIndex >= 75) {
      consciousnessState = "Self-Optimizing";
    } else if (consciousnessIndex >= 55) {
      consciousnessState = "Adaptive";
    } else if (consciousnessIndex >= 35) {
      consciousnessState = "Learning";
    }

    return res.json({
      ok: true,
      consciousness: {
        consciousness_index:
          consciousnessIndex,

        consciousness_state:
          consciousnessState,

        brain_state:
          health.brain_state,

        neural_density:
          density.neural_density || 0,

        recent_activity_heat:
          recentHeat,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load brain consciousness",
    });
  }
});



// RECORD REAL OUTCOME FEEDBACK
app.post("/api/outcome-feedback", async (req, res) => {
  try {
    const {
      business_id,
      company,
      outcome_type,
      success = false,
      notes = "",
    } = req.body;

    if (!company || !outcome_type) {
      return res.status(400).json({
        ok: false,
        error: "company and outcome_type required",
      });
    }

    const contributingFactors = [];

    const notesLower =
      notes.toLowerCase();

    if (notesLower.includes("onboarding")) {
      contributingFactors.push("onboarding");
    }

    if (
      notesLower.includes("fast") ||
      notesLower.includes("quick")
    ) {
      contributingFactors.push("fast_response");
    }

    const { data, error } = await supabase
      .from("workflow_outcomes")
      .insert([
        {
          business_id,
          company,
          outcome_type,
          success,
          notes,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    await supabase
      .from("prediction_outcomes")
      .insert([
        {
          business_id,
          company,

          prediction_type:
            outcome_type,

          predicted_value:
            success ? 100 : 0,

          actual_outcome:
            outcome_type,

          success,

          contributing_factors:
            contributingFactors,
        },
      ]);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to record outcome feedback",
      });
    }

    // REAL STRATEGY REINFORCEMENT

    const strategyMatches =
      await supabase
        .from("strategy_memory")
        .select("*")
        .eq("business_id", business_id);

    for (const strategy of strategyMatches.data || []) {

      let shouldReinforce = false;

      const category =
        (strategy.category || "").toLowerCase();

      const notesLower =
        notes.toLowerCase();

      if (
        category.includes("onboarding") &&
        notesLower.includes("onboarding")
      ) {
        shouldReinforce = true;
      }

      if (
        category.includes("urgency") &&
        notesLower.includes("fast")
      ) {
        shouldReinforce = true;
      }

      if (!shouldReinforce) {
        continue;
      }

      const current =
        strategy.adaptive_confidence ||
        strategy.confidence ||
        50;

      const updated =
        success
          ? Math.min(100, current + 4)
          : Math.max(10, current - 3);

      await supabase
        .from("strategy_memory")
        .update({
          adaptive_confidence: updated,
        })
        .eq("id", strategy.id);

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id,

            event_type:
              "strategy_reinforced",

            event_title:
              strategy.category,

            event_summary:
              success
                ? "Successful real-world outcome reinforced strategy confidence."
                : "Negative outcome reduced strategy confidence.",

            before_value:
              String(current),

            after_value:
              String(updated),

            source_table:
              "strategy_memory",

            source_id:
              strategy.id,
          },
        ]);
    }


    // ASSOCIATION REINFORCEMENT FINAL

    const associationsResult =
      await supabase
        .from("memory_associations")
        .select("*")
        .eq("business_id", business_id);

    for (const association of associationsResult.data || []) {

      const observation =
        (association.observation || "").toLowerCase();

      let relevant = false;

      if (
        notesLower.includes("onboarding") &&
        observation.includes("onboarding")
      ) {
        relevant = true;
      }

      if (
        (
          notesLower.includes("fast") ||
          notesLower.includes("quick")
        ) &&
        observation.includes("rapid")
      ) {
        relevant = true;
      }

      if (!relevant) {
        continue;
      }

      const currentStrength =
        Number(association.association_strength || 50);

      const updatedStrength =
        success
          ? Math.min(100, currentStrength + 4)
          : Math.max(10, currentStrength - 3);

      await supabase
        .from("memory_associations")
        .update({
          association_strength:
            updatedStrength,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", association.id);

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id,

            event_type:
              "association_reinforced",

            event_title:
              `${association.source_memory} → ${association.target_memory}`,

            event_summary:
              success
                ? "Successful outcome strengthened associative reasoning."
                : "Failed outcome weakened associative reasoning.",

            before_value:
              String(currentStrength),

            after_value:
              String(updatedStrength),

            source_table:
              "memory_associations",

            source_id:
              association.id,
          },
        ]);
    }


    // INTERVENTION CHAIN REINFORCEMENT

    const chainResult =
      await supabase
        .from("intervention_chains")
        .select("*")
        .eq("business_id", business_id);

    for (const chain of chainResult.data || []) {
      const actionsText =
        JSON.stringify(chain.ordered_actions || []).toLowerCase();

      let relevant = false;

      if (
        notesLower.includes("onboarding") &&
        actionsText.includes("onboarding")
      ) {
        relevant = true;
      }

      if (
        (
          notesLower.includes("fast") ||
          notesLower.includes("quick")
        ) &&
        actionsText.includes("respond_under_15_minutes")
      ) {
        relevant = true;
      }

      if (!relevant) {
        continue;
      }

      const currentStrength =
        Number(chain.adaptive_strength || 50);

      const updatedStrength =
        success
          ? Math.min(100, currentStrength + 5)
          : Math.max(10, currentStrength - 4);

      await supabase
        .from("intervention_chains")
        .update({
          adaptive_strength: updatedStrength,
          success_count: success
            ? Number(chain.success_count || 0) + 1
            : Number(chain.success_count || 0),
          failure_count: success
            ? Number(chain.failure_count || 0)
            : Number(chain.failure_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chain.id);

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id,
            event_type: "intervention_chain_reinforced",
            event_title: chain.chain_name,
            event_summary: success
              ? "Successful outcome strengthened intervention chain."
              : "Failed outcome weakened intervention chain.",
            before_value: String(currentStrength),
            after_value: String(updatedStrength),
            source_table: "intervention_chains",
            source_id: chain.id,
          },
        ]);
    }

    return res.json({
      ok: true,
      outcome: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to record outcome feedback",
    });
  }
});



// GET MEMORY ASSOCIATIONS
app.get("/api/memory-associations", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("memory_associations")
      .select("*")
      .eq("business_id", businessId)
      .order("association_strength", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load memory associations",
      });
    }

    return res.json({
      ok: true,
      associations: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load memory associations",
    });
  }
});



// GENERATE TEMPORAL BEHAVIOR PATTERNS
app.post("/api/temporal-patterns/generate", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const [outcomeResult, actionResult] =
      await Promise.all([
        supabase
          .from("workflow_outcomes")
          .select("*")
          .eq("business_id", businessId),

        supabase
          .from("operator_actions")
          .select("*")
          .eq("business_id", businessId),
      ]);

    const patterns =
      generateTemporalPatterns({
        outcomes:
          outcomeResult.data || [],
        operatorActions:
          actionResult.data || [],
      });

    if (patterns.length > 0) {
      await supabase
        .from("temporal_behavior_patterns")
        .upsert(
          patterns.map((pattern) => ({
            business_id:
              businessId,

            ...pattern,

            updated_at:
              new Date().toISOString(),
          })),
          {
            onConflict:
              "business_id,pattern_type,observed_window",
          }
        );

      for (const pattern of patterns) {
        await supabase
          .from("brain_timeline_events")
          .insert([
            {
              business_id:
                businessId,

              event_type:
                "temporal_pattern_detected",

              event_title:
                pattern.pattern_type,

              event_summary:
                pattern.observation,

              before_value:
                "",

              after_value:
                String(pattern.impact_score),

              source_table:
                "temporal_behavior_patterns",
            },
          ]);
      }
    }

    return res.json({
      ok: true,
      patterns,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to generate temporal patterns",
    });
  }
});



// GENERATE TEMPORAL RESPONSE WINDOWS
app.post("/api/temporal-windows/generate", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const [outcomeResult, actionResult] =
      await Promise.all([
        supabase
          .from("workflow_outcomes")
          .select("*")
          .eq("business_id", businessId),

        supabase
          .from("operator_actions")
          .select("*")
          .eq("business_id", businessId),
      ]);

    const windows =
      generateTemporalWindows({
        outcomes:
          outcomeResult.data || [],
        operatorActions:
          actionResult.data || [],
      });

    for (const window of windows) {
      await supabase
        .from("temporal_response_windows")
        .upsert(
          {
            business_id:
              businessId,

            ...window,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "business_id,window_type,observed_window",
          }
        );
    }

    return res.json({
      ok: true,
      windows,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to generate temporal windows",
    });
  }
});



// GENERATE INTERVENTION SIMULATIONS
app.post("/api/intervention-simulations/generate", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const [
      associationResult,
      temporalPatternResult,
      temporalWindowResult,
    ] = await Promise.all([

      supabase
        .from("memory_associations")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("temporal_behavior_patterns")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("temporal_response_windows")
        .select("*")
        .eq("business_id", businessId),
    ]);

    const simulations =
      generateInterventionSimulations({
        associations:
          associationResult.data || [],

        temporalPatterns:
          temporalPatternResult.data || [],

        temporalWindows:
          temporalWindowResult.data || [],
      });

    for (const simulation of simulations) {

      await supabase
        .from("intervention_simulations")
        .upsert(
          {
            business_id:
              businessId,

            ...simulation,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "business_id,simulation_type",
          }
        );

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id:
              businessId,

            event_type:
              "intervention_simulated",

            event_title:
              simulation.simulation_type,

            event_summary:
              simulation.observation,

            before_value:
              "",

            after_value:
              String(simulation.probability_delta),

            source_table:
              "intervention_simulations",
          },
        ]);
    }

    return res.json({
      ok: true,
      simulations,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to generate intervention simulations",
    });
  }
});



// GET INTERVENTION SIMULATIONS
app.get("/api/intervention-simulations", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("intervention_simulations")
      .select("*")
      .eq("business_id", businessId)
      .order("confidence", { ascending: false });

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          "Failed to load intervention simulations",
      });
    }

    return res.json({
      ok: true,
      simulations:
        data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load intervention simulations",
    });
  }
});



// GENERATE INTERVENTION CHAINS
app.post("/api/intervention-chains/generate", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("intervention_simulations")
      .select("*")
      .eq("business_id", businessId);

    if (error) {
      console.error(error);
      return res.status(500).json({
        ok: false,
        error: "Failed to load intervention simulations",
      });
    }

    const chains =
      generateInterventionChains({
        simulations: data || [],
      });

    for (const chain of chains) {
      await supabase
        .from("intervention_chains")
        .upsert(
          {
            business_id: businessId,
            ...chain,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "business_id,chain_name",
          }
        );

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id: businessId,
            event_type: "intervention_chain_generated",
            event_title: chain.chain_name,
            event_summary: chain.observation,
            before_value: "",
            after_value: String(chain.cumulative_probability_delta),
            source_table: "intervention_chains",
          },
        ]);
    }

    return res.json({
      ok: true,
      chains,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      error: "Failed to generate intervention chains",
    });
  }
});



// GET INTERVENTION CHAINS
app.get("/api/intervention-chains", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("intervention_chains")
      .select("*")
      .eq("business_id", businessId)
      .order("confidence", { ascending: false });

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load intervention chains",
      });
    }

    return res.json({
      ok: true,
      chains: data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load intervention chains",
    });
  }
});



// GENERATE GLOBAL STRATEGY PATTERNS
app.post("/api/global-patterns/generate", async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("strategy_memory")
      .select("*");

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error: "Failed to load strategies",
      });
    }

    const patterns =
      generateGlobalPatterns({
        strategies:
          data || [],
      });

    for (const pattern of patterns) {

      const existingPattern =
        await supabase
          .from("global_strategy_patterns")
          .select("*")
          .eq("industry", pattern.industry)
          .eq("pattern_type", pattern.pattern_type)
          .maybeSingle();

      const previousConfidence =
        Number(existingPattern.data?.confidence || 0);

      await supabase
        .from("global_strategy_patterns")
        .upsert(
          {
            ...pattern,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "industry,pattern_type",
          }
        );

      if (!existingPattern.data) {
        await supabase
          .from("brain_timeline_events")
          .insert([
            {
              business_id:
                "global",

              event_type:
                "global_pattern_detected",

              event_title:
                `${pattern.industry}:${pattern.pattern_type}`,

              event_summary:
                pattern.observation,

              before_value:
                "",

              after_value:
                String(pattern.confidence),

              source_table:
                "global_strategy_patterns",
            },
          ]);
      }

      if (
        existingPattern.data &&
        Number(pattern.confidence || 0) >
          previousConfidence
      ) {
        await supabase
          .from("brain_timeline_events")
          .insert([
            {
              business_id:
                "global",

              event_type:
                "global_pattern_confidence_shift",

              event_title:
                `${pattern.industry}:${pattern.pattern_type}`,

              event_summary:
                pattern.recommendation,

              before_value:
                String(previousConfidence),

              after_value:
                String(pattern.confidence),

              source_table:
                "global_strategy_patterns",
            },
          ]);
      }
    }

    return res.json({
      ok: true,
      patterns,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to generate global strategy patterns",
    });
  }
});



// GET GLOBAL STRATEGY PATTERNS
app.get("/api/global-patterns", async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("global_strategy_patterns")
      .select("*")
      .order("confidence", { ascending: false });

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          "Failed to load global strategy patterns",
      });
    }

    return res.json({
      ok: true,
      patterns:
        data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load global strategy patterns",
    });
  }
});



// APPLY GLOBAL WEIGHT ADAPTATION
app.post("/api/global-weight-adaptation/apply", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("global_strategy_patterns")
      .select("*");

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          "Failed to load global strategy patterns",
      });
    }

    const adjustments =
      generateGlobalWeightAdjustments({
        patterns:
          data || [],
      });

    const applied = [];

    for (const adjustment of adjustments) {

      const existing =
        await supabase
          .from("runtime_optimization_weights")
          .select("*")
          .eq("business_id", businessId)
          .eq("weight_key", adjustment.weight_key)
          .maybeSingle();

      const current =
        Number(existing.data?.weight_value || 1);

      const matchingPattern =
        (data || []).find((pattern) => {

          if (
            adjustment.weight_key ===
              "fast_response_weight" &&
            String(pattern.pattern_type || "")
              .includes("rapid_response")
          ) {
            return true;
          }

          if (
            adjustment.weight_key ===
              "onboarding_reassurance_weight" &&
            String(pattern.pattern_type || "")
              .includes("onboarding")
          ) {
            return true;
          }

          return false;
        });

      const globalConfidence =
        Number(matchingPattern?.confidence || 0);

      const lastConfidence =
        Number(
          existing.data?.global_confidence_snapshot || 0
        );

      if (
        globalConfidence <= lastConfidence
      ) {
        continue;
      }

      const updated =
        Number(
          Math.min(
            5,
            Math.max(
              0.25,
              current + adjustment.delta
            )
          ).toFixed(2)
        );

      if (existing.data?.id) {
        await supabase
          .from("runtime_optimization_weights")
          .update({
            weight_value:
              updated,

            global_confidence_snapshot:
              globalConfidence,

            reasoning:
              adjustment.reasoning,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.data.id);
      } else {
        await supabase
          .from("runtime_optimization_weights")
          .insert([
            {
              business_id:
                businessId,

              weight_key:
                adjustment.weight_key,

              weight_value:
                updated,

              global_confidence_snapshot:
                globalConfidence,

              reasoning:
                adjustment.reasoning,

              updated_at:
                new Date().toISOString(),
            },
          ]);
      }

      if (updated !== current) {
        await supabase
          .from("brain_timeline_events")
          .insert([
            {
              business_id:
                "global",

              event_type:
                "global_weight_adaptation",

              event_title:
                adjustment.weight_key,

              event_summary:
                adjustment.reasoning,

              before_value:
                String(current),

              after_value:
                String(updated),

              source_table:
                "runtime_optimization_weights",
            },
          ]);
      }

      applied.push({
        weight_key:
          adjustment.weight_key,

        before:
          current,

        after:
          updated,
      });
    }

    return res.json({
      ok: true,
      adjustments:
        applied,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to apply global weight adaptation",
    });
  }
});



// GET AUDIT LOGS
app.get("/api/audit-logs", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const businessId =
      requireBusinessId(req, res);

    if (!businessId) {
      return;
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      })
      .limit(250);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          "Failed to load audit logs",
      });
    }

    return res.json({
      ok: true,
      logs:
        data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load audit logs",
    });
  }
});



// GET ROLLBACK SNAPSHOTS
app.get("/api/rollback-snapshots", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const businessId =
      requireBusinessId(req, res);

    if (!businessId) {
      return;
    }

    const { data, error } = await supabase
      .from("rollback_snapshots")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      })
      .limit(250);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          "Failed to load rollback snapshots",
      });
    }

    return res.json({
      ok: true,
      snapshots:
        data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load rollback snapshots",
    });
  }
});



// GENERATE OPERATIONAL HEALTH METRICS
app.post("/api/operational-health/generate", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const businessId =
      requireBusinessId(req, res);

    if (!businessId) {
      return;
    }

    const [
      failureResult,
      approvalResult,
      predictionResult,
    ] = await Promise.all([

      supabase
        .from("system_failures")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("followup_approvals")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("predictive_insights")
        .select("*")
        .eq("business_id", businessId),
    ]);

    const metrics =
      generateOperationalHealth({
        failures:
          failureResult.data || [],

        approvals:
          approvalResult.data || [],

        predictions:
          predictionResult.data || [],
      });

    for (const metric of metrics) {

      await supabase
        .from("operational_health_metrics")
        .insert([
          {
            business_id:
              businessId,

            ...metric,
          },
        ]);

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id:
              businessId,

            event_type:
              "operational_health_alert",

            event_title:
              metric.metric_type,

            event_summary:
              metric.observation,

            before_value:
              "",

            after_value:
              String(metric.metric_value),

            source_table:
              "operational_health_metrics",
          },
        ]);
    }

    return res.json({
      ok: true,
      metrics,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to generate operational health metrics",
    });
  }
});



// GET JOB QUEUE
app.get("/api/job-queue", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const businessId =
      requireBusinessId(req, res);

    if (!businessId) {
      return;
    }

    const { data, error } = await supabase
      .from("job_queue")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      })
      .limit(250);

    if (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          "Failed to load job queue",
      });
    }

    return res.json({
      ok: true,
      jobs:
        data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load job queue",
    });
  }
});



// GET DEAD LETTER JOBS
app.get("/api/dead-letter-jobs", async (req, res) => {
  try {
    if (!requireApiAuth(req, res)) return;

    if (!requireRole({ req, res, allowedRoles: ["admin"] })) return;

    const businessId = requireBusinessId(req, res);
    if (!businessId) return;

    const { data, error } = await supabase
      .from("dead_letter_jobs")
      .select("*")
      .eq("business_id", businessId)
      .order("failed_at", { ascending: false })
      .limit(250);

    if (error) throw error;

    return res.json({
      ok: true,
      jobs: data || [],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: "Failed to load dead-letter jobs",
    });
  }
});



// GET WORKER HEARTBEATS
app.get("/api/worker-heartbeats", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const { data, error } = await supabase
      .from("worker_heartbeats")
      .select("*")
      .order("last_heartbeat", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.json({
      ok: true,
      workers:
        data || [],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load worker heartbeats",
    });
  }
});



// GET WORKER HEALTH
app.get("/api/worker-health", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const { data, error } = await supabase
      .from("worker_heartbeats")
      .select("*");

    if (error) {
      throw error;
    }

    const alerts =
      detectWorkerHealth({
        workers:
          data || [],
      });

    return res.json({
      ok: true,
      alerts,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to evaluate worker health",
    });
  }
});



// GET WORKER RECOVERY RECOMMENDATIONS
app.get("/api/worker-recovery", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const { data, error } = await supabase
      .from("worker_heartbeats")
      .select("*");

    if (error) {
      throw error;
    }

    const alerts =
      detectWorkerHealth({
        workers:
          data || [],
      });

    const recoveries =
      generateWorkerRecovery({
        alerts,
      });

    const mode =
      evaluateSystemMode({
        alerts,
        recoveries,
      });

    const existingMode =
      await supabase
        .from("system_modes")
        .select("*")
        .eq("business_id", "global")
        .maybeSingle();

    if (
      existingMode.data?.mode !==
      mode.mode
    ) {

      await supabase
        .from("system_modes")
        .upsert(
          {
            business_id:
              "global",

            mode:
              mode.mode,

            reason:
              mode.reason,

            activated_by:
              "system",

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "business_id",
          }
        );

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id:
              "global",

            event_type:
              "system_mode_changed",

            event_title:
              mode.mode,

            event_summary:
              mode.reason,

            before_value:
              existingMode.data?.mode || "",

            after_value:
              mode.mode,

            source_table:
              "system_modes",
          },
        ]);
    }

    for (const recovery of recoveries) {

      await supabase
        .from("brain_timeline_events")
        .insert([
          {
            business_id:
              "global",

            event_type:
              "worker_recovery_recommended",

            event_title:
              recovery.recovery_type,

            event_summary:
              recovery.recommendation,

            before_value:
              "",

            after_value:
              recovery.target_worker,

            source_table:
              "worker_heartbeats",
          },
        ]);
    }

    return res.json({
      ok: true,
      recoveries,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to generate worker recovery recommendations",
    });
  }
});



// GET OPERATIONS OVERVIEW
app.get("/api/operations-overview", async (req, res) => {
  try {

    if (!requireApiAuth(req, res)) {
      return;
    }

    if (!requireRole({
      req,
      res,
      allowedRoles: ["admin"],
    })) {
      return;
    }

    const businessId =
      requireBusinessId(req, res);

    if (!businessId) {
      return;
    }

    const [
      queueResult,
      workerResult,
      failureResult,
      modeResult,
      auditResult,
      deadLetterResult,
    ] = await Promise.all([

      supabase
        .from("job_queue")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("worker_heartbeats")
        .select("*"),

      supabase
        .from("system_failures")
        .select("*")
        .eq("business_id", businessId),

      supabase
        .from("system_modes")
        .select("*")
        .eq("business_id", "global")
        .maybeSingle(),

      supabase
        .from("audit_logs")
        .select("*")
        .eq("business_id", businessId)
        .limit(25),

      supabase
        .from("dead_letter_jobs")
        .select("*")
        .eq("business_id", businessId),
    ]);

    return res.json({
      ok: true,

      overview: {
        queue:
          queueResult.data || [],

        workers:
          workerResult.data || [],

        failures:
          failureResult.data || [],

        mode:
          modeResult.data || null,

        audits:
          auditResult.data || [],

        deadLetters:
          deadLetterResult.data || [],
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error:
        "Failed to load operations overview",
    });
  }
});


const PORT = 3002;

// GET OPERATOR OUTCOME CORRELATIONS
app.get("/api/operator-correlations", async (req, res) => {
  try {
    const businessId =
      requireBusinessId(req, res);

    if (!businessId) return;

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
      business_id,
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

      for (const correlation of correlations) {

        const existingCorrelation =
          await supabase
            .from("operator_outcome_correlations")
            .select("*")
            .eq("business_id", business_id)
            .eq("correlation_type", correlation.correlation_type)
            .maybeSingle();

        const previousConfidence =
          existingCorrelation.data?.confidence || 0;

        if (
          correlation.confidence > previousConfidence
        ) {

          await supabase
            .from("brain_timeline_events")
            .insert([
              {
                business_id,

                event_type:
                  "correlation_confidence_increase",

                event_title:
                  correlation.correlation_type,

                event_summary:
                  correlation.observation,

                before_value:
                  String(previousConfidence),

                after_value:
                  String(correlation.confidence),

                source_table:
                  "operator_outcome_correlations",
              },
            ]);
        }
      }

      await supabase
        .from("operator_outcome_correlations")
        .upsert(
          correlations,
          {
            onConflict: "business_id,correlation_type",
          }
        );

      const adjustments = [];

      for (const correlation of correlations) {

        const existingCorrelation =
          await supabase
            .from("operator_outcome_correlations")
            .select("*")
            .eq("business_id", business_id)
            .eq("correlation_type", correlation.correlation_type)
            .maybeSingle();

        const previousConfidence =
          existingCorrelation.data?.confidence || 0;

        if (
          correlation.confidence > previousConfidence
        ) {

          const generated =
            generateWeightAdjustments({
              correlations: [correlation],
            });

          adjustments.push(...generated);
        }
      }

      for (const adjustment of adjustments) {

        const existing =
          await supabase
            .from("runtime_optimization_weights")
            .select("*")
            .eq("weight_key", adjustment.weight_key)
            .maybeSingle();

        const current =
          Number(
            Number(existing.data?.weight_value || 1.0).toFixed(2)
          );

        const updated =
          Number(
            Math.min(
              3,
              Math.max(
                0.25,
                Number(current) + adjustment.delta
              )
            ).toFixed(2)
          );

        await supabase
          .from("runtime_optimization_weights")
          .update({
            weight_value: updated,
            reasoning: adjustment.reasoning,
            updated_at: new Date().toISOString(),
          })
          .eq("weight_key", adjustment.weight_key);

        await supabase
          .from("brain_timeline_events")
          .insert([
            {
              business_id,
              event_type: "runtime_weight_adjusted",

              event_title:
                adjustment.weight_key,

              event_summary:
                adjustment.reasoning,

              before_value:
                String(current),

              after_value:
                String(updated),

              source_table:
                "runtime_optimization_weights",
            },
          ]);
      }
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
      requireBusinessId(req, res);

    if (!businessId) return;

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
      business_id,
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
      business_id,
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
      requireBusinessId(req, res);

    if (!businessId) return;

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
      requireBusinessId(req, res);

    if (!businessId) return;

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
      business_id,
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
      .eq("business_id", requireBusinessId(req, res))
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
        business_id: businessId,
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
      .eq("business_id", requireBusinessId(req, res))
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
app.post("/api/inbound/resend", automationLimiter, async (req, res) => {
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
      requireBusinessId(req, res);

    if (!businessId) return;

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

      const systemMode =
        await enforceSystemMode({
          supabase,
          businessId,
          actionType:
            "auto_followup",
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

              status:
                (
                  evaluateAutomationSafety({
                  confidence:
                    Number(classification.confidence || 0),

                  role:
                    req.headers["x-hermes-role"] || "viewer",

                  actionType:
                    "auto_followup",
                }).allowed &&
                  systemMode.allowed
                )
                  ? "pending"
                  : "blocked",

              safety_reason:
                !systemMode.allowed
                  ? systemMode.reason
                  : evaluateAutomationSafety({
                  confidence:
                    Number(classification.confidence || 0),

                  role:
                    req.headers["x-hermes-role"] || "viewer",

                  actionType:
                    "auto_followup",
                }).reason,

              business_id:
                businessId,
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
          .eq("business_id", businessId)
          .order("adaptive_confidence", {
            ascending: false,
          })
          .limit(8);

      const associations =
        extractMemoryAssociations({
          memory,
          strategies:
            strategyResult.data || [],
        });

      if (associations.length > 0) {

        for (const association of associations) {

          const existingAssociation =
            await supabase
              .from("memory_associations")
              .select("*")
              .eq("business_id", businessId)
              .eq("source_memory", association.source_memory)
              .eq("target_memory", association.target_memory)
              .maybeSingle();

          const existingStrength =
            Number(existingAssociation.data?.association_strength || 0);

          const nextStrength =
            Math.max(
              existingStrength,
              Number(association.association_strength || 0)
            );

          await supabase
            .from("memory_associations")
            .upsert(
              {
                business_id:
                  businessId,

                ...association,

                association_strength:
                  nextStrength,

                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict:
                  "business_id,source_memory,target_memory",
              }
            );
        }
      }

      predictiveInsights =
        generatePredictiveInsights({
          lead: updatedLead,
          memory,
          strategies: strategyResult.data || [],
        });

      const correlationResult =
        await supabase
          .from("operator_outcome_correlations")
          .select("*")
          .eq("business_id", businessId);

      const weightResult =
        await supabase
          .from("runtime_optimization_weights")
          .select("*")
          .eq("business_id", businessId);

      predictiveInsights =
        applyOperationalOptimizations({
          predictiveInsights,
          correlations:
            correlationResult.data || [],
          weights:
            weightResult.data || [],
        });

      const predictionOutcomeResult =
        await supabase
          .from("prediction_outcomes")
          .select("*")
          .eq("business_id", businessId)
          .eq("company", company);

      predictiveInsights =
        calibratePredictiveInsights({
          predictiveInsights,
          predictionOutcomes:
            predictionOutcomeResult.data || [],
        });

      const associationResult =
        await supabase
          .from("memory_associations")
          .select("*")
          .eq("business_id", businessId)
          .order("updated_at", { ascending: false });

      predictiveInsights =
        applyAssociationReasoning({
          predictiveInsights,
          associations:
            associationResult.data || [],
        });

      const temporalPatternResult =
        await supabase
          .from("temporal_behavior_patterns")
          .select("*")
          .eq("business_id", businessId);

      predictiveInsights =
        applyTemporalReasoning({
          predictiveInsights,
          temporalPatterns:
            temporalPatternResult.data || [],
        });

      const temporalWindowResult =
        await supabase
          .from("temporal_response_windows")
          .select("*")
          .eq("business_id", businessId);

      predictiveInsights =
        applyTemporalWindowReasoning({
          predictiveInsights,
          temporalWindows:
            temporalWindowResult.data || [],
        });

      predictiveInsights =
        applyUrgencyDecay({
          lead: updatedLead || leadData || {},
          predictiveInsights,
        });

      const simulationResult =
        await supabase
          .from("intervention_simulations")
          .select("*")
          .eq("business_id", businessId);

      predictiveInsights =
        applySimulationPriority({
          predictiveInsights,
          simulations:
            simulationResult.data || [],
        });

      const chainResult =
        await supabase
          .from("intervention_chains")
          .select("*")
          .eq("business_id", businessId);

      predictiveInsights =
        applyChainPriority({
          predictiveInsights,
          chains:
            chainResult.data || [],
        });

      const globalPatternResult =
        await supabase
          .from("global_strategy_patterns")
          .select("*")
          .order("confidence", { ascending: false });

      predictiveInsights =
        applyGlobalPatternReasoning({
          predictiveInsights,
          globalPatterns:
            globalPatternResult.data || [],
        });

      if (
        predictionOutcomeResult.data &&
        predictionOutcomeResult.data.length > 0
      ) {

        await supabase
          .from("brain_timeline_events")
          .insert([
            {
              business_id:
                businessId,

              event_type:
                "prediction_calibrated",

              event_title:
                company,

              event_summary:
                `Prediction engine calibrated using ${predictionOutcomeResult.data.length} historical outcome(s).`,

              before_value:
                "",

              after_value:
                "",

              source_table:
                "prediction_outcomes",
            },
          ]);
      }

      const previousInsight =
        await supabase
          .from("predictive_insights")
          .select("*")
          .eq("business_id", businessId)
          .eq("company", company)
          .maybeSingle();

      if (previousInsight.data) {

        const prev =
          previousInsight.data;

        const mutations = [
          [
            "close_probability_shift",
            prev.close_probability,
            predictiveInsights.close_probability,
          ],
          [
            "recovery_probability_shift",
            prev.recovery_probability,
            predictiveInsights.recovery_probability,
          ],
          [
            "stale_risk_shift",
            prev.stale_risk,
            predictiveInsights.stale_risk,
          ],
        ];

        for (const [type, before, after] of mutations) {

          if (before !== after) {

            await supabase
              .from("brain_timeline_events")
              .insert([
                {
                  business_id:
                    businessId,

                  event_type:
                    type,

                  event_title:
                    company,

                  event_summary:
                    `Prediction calibration adjusted ${type.replaceAll("_", " ")}.`,

                  before_value:
                    String(before),

                  after_value:
                    String(after),

                  source_table:
                    "predictive_insights",
                },
              ]);
          }
        }
      }

      predictiveInsights.insight_signature =
        JSON.stringify({
          closeProbability:
            predictiveInsights.close_probability,

          responseProbability:
            predictiveInsights.response_probability,

          staleRisk:
            predictiveInsights.stale_risk,

          recoveryProbability:
            predictiveInsights.recovery_probability,

          recommendedIntervention:
            predictiveInsights.recommended_intervention,
        });

      await supabase
        .from("predictive_insights")
        .upsert(
          {
            business_id: businessId,
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
        business_id: businessId,
        created_at: new Date().toISOString(),
      },
      {
        type: "lead_updated_from_reply",
        company: company || fromEmail || "unknown",
        message: `Lead updated from inbound reply: ${classification.suggested_stage}`,
        payload: updatedLead,
        business_id: businessId,
        created_at: new Date().toISOString(),
      },
    ];

    if (autoApproval) {
      activityEvents.push({
        type: "auto_followup_queued",
        company,
        message: `Hermes auto-generated a followup proposal for ${company}`,
        payload: autoApproval,
        business_id: businessId,
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
app.post("/api/followup-approvals/:id/status", automationLimiter, async (req, res) => {
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

    // PREVENT NO-OP STATUS MUTATIONS

    if (
      approval.status === status
    ) {

      return res.json({
        ok: true,
        approval,
        skipped: true,
      });
    }

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

        await enqueueJob({
          supabase,

          businessId:
            approval.business_id,

          jobType:
            "send_followup_email",

          payload: {
            to:
              lead.email,

            subject:
              approval.subject,

            body:
              approval.body,

            company:
              approval.company,

            approval_id:
              approval.id,
          },
        });
      }
    }


    await createRollbackSnapshot({
      supabase,

      businessId:
        approval.business_id,

      snapshotType:
        "followup_approval",

      targetId:
        approval.id,

      snapshotData:
        approval,

      createdByRole:
        req.headers["x-hermes-role"] || "unknown",
    });

    const { data, error } = await supabase
      .from("followup_approvals")
      .update({
        status,
      })
      .eq("id", id)
      .select()
      .single();

    await createAuditLog({
      supabase,

      businessId:
        approval.business_id,

      actorRole:
        req.headers["x-hermes-role"] || "unknown",

      actionType:
        `followup_${status}`,

      targetType:
        "followup_approval",

      targetId:
        approval.id,

      beforeState: {
        status:
          approval.status,
      },

      afterState: {
        status,
      },

      reasoning:
        `Followup approval ${status} by ${req.headers["x-hermes-role"] || "unknown"}.`,
    });

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
      .eq("business_id", requireBusinessId(req, res))
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

          status:
            evaluateAutomationSafety({
              confidence: 85,
              role:
                req.headers["x-hermes-role"] || "viewer",
              actionType:
                "auto_followup",
            }).allowed
              ? "pending"
              : "blocked",

          safety_reason:
            evaluateAutomationSafety({
              confidence: 85,
              role:
                req.headers["x-hermes-role"] || "viewer",
              actionType:
                "auto_followup",
            }).reason,

          business_id:
            businessId,
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
        business_id: businessId,
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
    requireBusinessId(req, res);

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
        business_id: businessId,
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

      business_id: businessId,
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