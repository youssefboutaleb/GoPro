import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Circle,
  Calendar,
  Target,
  TrendingUp,
  User,
  Users,
  Building,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface VisitPlanData {
  id: string;
  doctor_name: string;
  brick_name: string;
  specialty: string;
  visit_frequency: number;
  monthly_visits: number[];
  visits_today: number;
  remaining_this_month: number;
  total_visits: number;
  expected_visits: number;
  return_index: number;
  row_color: "red" | "yellow" | "green";
  can_record_today: boolean;
  monthly_target_met: boolean;
  delegate_id: string;
  delegate_name: string;
  supervisor_id?: string;
  supervisor_name?: string;
}

interface InteractiveVisitTableProps {
  delegateIds?: string[];
  brickFilter?: string;
  specialtyFilter?: string;
  showDelegateGrouping?: boolean;
  showSupervisorGrouping?: boolean;
}

const InteractiveVisitTable: React.FC<InteractiveVisitTableProps> = ({
  delegateIds = [],
  brickFilter = "all",
  specialtyFilter = "all",
  showDelegateGrouping = false,
  showSupervisorGrouping = false,
}) => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [recordingVisit, setRecordingVisit] = useState<string | null>(null);

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds =
    delegateIds.length > 0 ? delegateIds : [user?.id].filter(Boolean);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const today = new Date().toISOString().split("T")[0];

  // Month names for headers
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Fetch visit plans with doctors, bricks, and supervisor data
  const { data: visitPlansData = [], isLoading } = useQuery({
    queryKey: [
      "interactive-visit-plans",
      effectiveDelegateIds.join(","),
      brickFilter,
      specialtyFilter,
    ],
    queryFn: async () => {
      if (effectiveDelegateIds.length === 0) return [];

      console.log("Fetching visit plans for interactive table...");

      // Fetch visit plans
      const { data: visitPlans, error: visitPlansError } = await supabase
        .from("visit_plans")
        .select("id, delegate_id, visit_frequency, doctor_id")
        .in("delegate_id", effectiveDelegateIds);

      if (visitPlansError) {
        console.error("Visit plans error:", visitPlansError);
        throw visitPlansError;
      }

      // Fetch doctors
      const doctorIds =
        visitPlans?.map((p) => p.doctor_id).filter(Boolean) || [];
      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id, first_name, last_name, specialty, brick_id")
        .in("id", doctorIds);

      if (doctorsError) {
        console.error("Doctors error:", doctorsError);
        throw doctorsError;
      }

      // Fetch bricks
      const brickIds = doctors?.map((d) => d.brick_id).filter(Boolean) || [];
      const { data: bricks, error: bricksError } = await supabase
        .from("bricks")
        .select("id, name")
        .in("id", brickIds);

      if (bricksError) {
        console.error("Bricks error:", bricksError);
        throw bricksError;
      }

      // Fetch delegate profiles with supervisor info
      const { data: delegateProfiles, error: delegatesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, supervisor_id")
        .in("id", effectiveDelegateIds);

      if (delegatesError) {
        console.error("Delegates error:", delegatesError);
        throw delegatesError;
      }

      // Fetch supervisor profiles if needed
      let supervisorProfiles: any[] = [];
      if (showSupervisorGrouping) {
        const supervisorIds = [
          ...new Set(
            delegateProfiles?.map((d) => d.supervisor_id).filter(Boolean)
          ),
        ];
        if (supervisorIds.length > 0) {
          const { data: supervisors, error: supervisorsError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", supervisorIds);

          if (supervisorsError) {
            console.error("Supervisors error:", supervisorsError);
            throw supervisorsError;
          }
          supervisorProfiles = supervisors || [];
        }
      }

      // Fetch visits for this year
      const visitPlanIds = visitPlans?.map((p) => p.id) || [];
      const { data: visits, error: visitsError } = await supabase
        .from("visits")
        .select("id, visit_plan_id, visit_date")
        .in("visit_plan_id", visitPlanIds)
        .gte("visit_date", `${currentYear}-01-01`)
        .lte("visit_date", `${currentYear}-12-31`);

      if (visitsError) {
        console.error("Visits error:", visitsError);
        throw visitsError;
      }

      // Process the data
      const processed: VisitPlanData[] = [];

      for (const visitPlan of visitPlans || []) {
        const doctor = doctors?.find((d) => d.id === visitPlan.doctor_id);
        const brick = doctor
          ? bricks?.find((b) => b.id === doctor.brick_id)
          : null;
        const delegate = delegateProfiles?.find(
          (d) => d.id === visitPlan.delegate_id
        );
        const supervisor = showSupervisorGrouping
          ? supervisorProfiles?.find((s) => s.id === delegate?.supervisor_id)
          : null;

        if (!doctor || !delegate) continue;

        // Apply filters
        if (brickFilter !== "all" && brick?.name !== brickFilter) continue;
        if (specialtyFilter !== "all" && doctor.specialty !== specialtyFilter)
          continue;

        const monthlyFrequency = visitPlan.visit_frequency === "1" ? 1 : 2;

        // Calculate actual visits per month
        const monthly_visits = Array(12).fill(0);
        const planVisits =
          visits?.filter((v) => v.visit_plan_id === visitPlan.id) || [];

        planVisits.forEach((visit) => {
          const visitDate = new Date(visit.visit_date);
          const monthIndex = visitDate.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            monthly_visits[monthIndex]++;
          }
        });

        // Calculate visits today
        const visitsToday = planVisits.filter(
          (v) => v.visit_date === today
        ).length;

        // Calculate remaining visits for current month
        const currentMonthVisits = monthly_visits[currentMonth - 1] || 0;
        const remainingThisMonth = Math.max(
          0,
          monthlyFrequency - currentMonthVisits
        );

        // Calculate total visits and expected visits
        const totalVisits = monthly_visits.reduce(
          (sum, count) => sum + count,
          0
        );
        const expectedVisits = currentMonth * monthlyFrequency;

        // Calculate return index
        const returnIndex =
          expectedVisits > 0
            ? Math.round((totalVisits / expectedVisits) * 100)
            : 0;

        // Check if monthly target is met for current month
        const monthlyTargetMet = currentMonthVisits >= monthlyFrequency;

        let rowColor: "red" | "yellow" | "green" = "red";
        if (returnIndex >= 80) {
          rowColor = "green";
        } else if (returnIndex >= 50) {
          rowColor = "yellow";
        }

        // Can record if haven't exceeded monthly limit and haven't recorded today
        const canRecordToday =
          currentMonthVisits < monthlyFrequency && visitsToday === 0;

        processed.push({
          id: visitPlan.id,
          doctor_name: `${doctor.first_name} ${doctor.last_name}`,
          brick_name: brick?.name || "Unknown Brick",
          specialty: doctor.specialty || "N/A",
          visit_frequency: monthlyFrequency,
          monthly_visits,
          visits_today: visitsToday,
          remaining_this_month: remainingThisMonth,
          total_visits: totalVisits,
          expected_visits: expectedVisits,
          return_index: returnIndex,
          row_color: rowColor,
          can_record_today: canRecordToday,
          monthly_target_met: monthlyTargetMet,
          delegate_id: visitPlan.delegate_id,
          delegate_name: `${delegate.first_name} ${delegate.last_name}`,
          supervisor_id: delegate.supervisor_id,
          supervisor_name: supervisor
            ? `${supervisor.first_name} ${supervisor.last_name}`
            : undefined,
        });
      }

      console.log("Processed visit plans:", processed.length);
      return processed;
    },
    enabled: effectiveDelegateIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Group data by supervisor and delegate when showing grouping
  const groupedData = React.useMemo(() => {
    if (showSupervisorGrouping) {
      // Group by supervisor first, then by delegate within each supervisor
      const supervisorGroups: {
        [key: string]: { [key: string]: VisitPlanData[] };
      } = {};

      visitPlansData.forEach((plan) => {
        const supervisorKey = plan.supervisor_id
          ? `${plan.supervisor_id}|${
              plan.supervisor_name || "Unknown Supervisor"
            }`
          : "unknown|No Supervisor";
        const delegateKey = `${plan.delegate_id}|${plan.delegate_name}`;

        if (!supervisorGroups[supervisorKey]) {
          supervisorGroups[supervisorKey] = {};
        }
        if (!supervisorGroups[supervisorKey][delegateKey]) {
          supervisorGroups[supervisorKey][delegateKey] = [];
        }
        supervisorGroups[supervisorKey][delegateKey].push(plan);
      });

      return supervisorGroups;
    } else if (showDelegateGrouping) {
      // Group by delegate only
      const groups: { [key: string]: VisitPlanData[] } = {};
      visitPlansData.forEach((plan) => {
        const key = `${plan.delegate_id}|${plan.delegate_name}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(plan);
      });
      return { single: groups };
    }

    return { single: { all: visitPlansData } };
  }, [visitPlansData, showDelegateGrouping, showSupervisorGrouping]);

  // Mutation to record a visit
  const recordVisitMutation = useMutation({
    mutationFn: async (visitPlanId: string) => {
      console.log("Recording visit for plan:", visitPlanId);

      const { data, error } = await supabase
        .from("visits")
        .insert({
          visit_plan_id: visitPlanId,
          visit_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error recording visit:", error);
        throw error;
      }

      console.log("Visit recorded successfully:", data);
      return data;
    },
    onSuccess: (data, visitPlanId) => {
      const visitPlan = visitPlansData.find((plan) => plan.id === visitPlanId);
      const doctorName = visitPlan?.doctor_name || "Doctor";

      toast({
        title: "Visit Recorded!",
        description: `Successfully recorded visit for ${doctorName}`,
      });

      queryClient.invalidateQueries({ queryKey: ["interactive-visit-plans"] });
      queryClient.invalidateQueries({ queryKey: ["delegate-dashboard-stats"] });
    },
    onError: (error: any, visitPlanId) => {
      console.error("Failed to record visit:", error);

      const visitPlan = visitPlansData.find((plan) => plan.id === visitPlanId);
      const doctorName = visitPlan?.doctor_name || "Doctor";

      toast({
        title: "Failed to Record Visit",
        description: `Could not record visit for ${doctorName}. ${
          error.message || "Please try again."
        }`,
        variant: "destructive",
      });
    },
  });

  const handleRecordVisit = async (visitPlan: VisitPlanData) => {
    if (recordingVisit) return;

    if (!visitPlan.can_record_today) {
      toast({
        title: "Cannot Record Visit",
        description:
          visitPlan.visits_today > 0
            ? "You've already recorded a visit for this doctor today"
            : "Monthly visit limit reached for this doctor",
        variant: "destructive",
      });
      return;
    }

    setRecordingVisit(visitPlan.id);
    try {
      await recordVisitMutation.mutateAsync(visitPlan.id);
    } catch (error) {
      console.error("Error in handleRecordVisit:", error);
    } finally {
      setRecordingVisit(null);
    }
  };

  const getRowColorClass = (color: "red" | "yellow" | "green") => {
    switch (color) {
      case "green":
        return "bg-green-50 border-l-4 border-l-green-500";
      case "yellow":
        return "bg-yellow-50 border-l-4 border-l-yellow-500";
      case "red":
        return "bg-red-50 border-l-4 border-l-red-500";
      default:
        return "";
    }
  };

  // Calculate summary stats
  const totalVisitPlans = visitPlansData.length;
  const totalVisits = visitPlansData.reduce(
    (sum, plan) => sum + plan.total_visits,
    0
  );
  const averageReturnIndex =
    totalVisitPlans > 0
      ? Math.round(
          visitPlansData.reduce((sum, plan) => sum + plan.return_index, 0) /
            totalVisitPlans
        )
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const renderTable = (data: VisitPlanData[], delegateName?: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-3 font-medium text-gray-700">
              Doctor
            </th>
            <th className="text-left py-3 px-3 font-medium text-gray-700">
              Brick
            </th>
            <th className="text-left py-3 px-3 font-medium text-gray-700">
              Specialty
            </th>
            <th className="text-center py-3 px-2 font-medium text-gray-700">
              Freq
            </th>
            {monthNames.slice(0, currentMonth).map((month, index) => (
              <th
                key={month}
                className="text-center py-3 px-2 font-medium text-gray-700 min-w-[40px]"
              >
                {month}
              </th>
            ))}
            <th className="text-center py-3 px-3 font-medium text-gray-700">
              Remaining
            </th>
            <th className="text-center py-3 px-3 font-medium text-gray-700">
              Total
            </th>
            <th className="text-center py-3 px-3 font-medium text-gray-700">
              Expected
            </th>
            <th className="text-center py-3 px-3 font-medium text-gray-700">
              Return Index
            </th>
            <th className="text-center py-3 px-3 font-medium text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((plan) => (
            <tr
              key={plan.id}
              className={`relative ${getRowColorClass(plan.row_color)} ${
                recordingVisit === plan.id ? "bg-blue-100" : ""
              } transition-all duration-200`}
            >
              <td className="py-3 px-3">
                <div className="flex items-center space-x-2">
                  {plan.visits_today > 0 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {plan.monthly_target_met && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium text-gray-900">
                    {plan.doctor_name}
                  </span>
                </div>
              </td>
              <td className="py-3 px-3 text-gray-600">{plan.brick_name}</td>
              <td className="py-3 px-3 text-gray-600">{plan.specialty}</td>
              <td className="py-3 px-2 text-center text-gray-700">
                {plan.visit_frequency}x/month
              </td>
              {plan.monthly_visits
                .slice(0, currentMonth)
                .map((count, index) => (
                  <td
                    key={index}
                    className="py-3 px-2 text-center text-gray-700"
                  >
                    {count || "-"}
                  </td>
                ))}
              <td className="py-3 px-3 text-center text-gray-700">
                {plan.remaining_this_month}
              </td>
              <td className="py-3 px-3 text-center font-medium text-gray-900">
                {plan.total_visits}
              </td>
              <td className="py-3 px-3 text-center text-gray-700">
                {plan.expected_visits}
              </td>
              <td className="py-3 px-3 text-center">
                <span
                  className={`font-medium ${
                    plan.return_index >= 80
                      ? "text-green-600"
                      : plan.return_index >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {plan.return_index}%
                </span>
              </td>
              <td className="py-3 px-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecordVisit(plan)}
                  disabled={
                    !plan.can_record_today || recordingVisit === plan.id
                  }
                  className={plan.can_record_today ? "hover:bg-green-100" : ""}
                >
                  {recordingVisit === plan.id ? "Recording..." : "Record Visit"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalVisitPlans}
            </div>
            <div className="text-sm text-gray-600">Total Visit Plans</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalVisits}
            </div>
            <div className="text-sm text-gray-600">Total Visits</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {averageReturnIndex}%
            </div>
            <div className="text-sm text-gray-600">Average Return Index</div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Plans Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visit Plans Analysis</CardTitle>
          <p className="text-sm text-gray-500">
            Click the "Record Visit" button to log a visit
          </p>
        </CardHeader>
        <CardContent>
          {showSupervisorGrouping && Object.keys(groupedData).length > 1 ? (
            <div className="space-y-8">
              {Object.entries(groupedData).map(
                ([supervisorKey, delegateGroups]) => {
                  const [supervisorId, supervisorName] =
                    supervisorKey.split("|");
                  const totalDelegates = Object.keys(delegateGroups).length;

                  return (
                    <div key={supervisorKey}>
                      {/* Supervisor Section Header */}
                      <div className="mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <Building className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {supervisorName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {totalDelegates} delegate
                              {totalDelegates !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Separator className="mb-4" />
                      </div>

                      {/* Delegates within this Supervisor */}
                      <div className="space-y-6 ml-8">
                        {Object.entries(delegateGroups).map(
                          ([delegateKey, data]) => {
                            const [delegateId, delegateName] =
                              delegateKey.split("|");
                            return (
                              <div key={delegateKey}>
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="p-1 bg-blue-100 rounded-full">
                                    <Users className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-800">
                                      {delegateName}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {data.length} visit plans
                                    </p>
                                  </div>
                                </div>
                                {renderTable(data, delegateName)}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : showDelegateGrouping &&
            Object.keys(groupedData.single || {}).length > 1 ? (
            <div className="space-y-8">
              {Object.entries(groupedData.single || {}).map(([key, data]) => {
                const [delegateId, delegateName] = key.split("|");
                return (
                  <div key={key}>
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {delegateName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {data.length} visit plans
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </div>
                    {renderTable(data, delegateName)}
                  </div>
                );
              })}
            </div>
          ) : (
            renderTable(visitPlansData)
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">How to record visits:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Green checkmark: Visit recorded today</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Blue checkmark: Monthly frequency target met</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-green-500"></div>
              <span>Green border: Good performance (≥80%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-yellow-500"></div>
              <span>Yellow border: Moderate performance (50-79%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span>Red border: Needs improvement (&lt;50%)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Tip: Click the "Record Visit" button to log a visit
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveVisitTable;
