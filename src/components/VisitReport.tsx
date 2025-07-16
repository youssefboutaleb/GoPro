import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isSameDay } from 'date-fns';

interface VisitReportProps {
  onBack: () => void;
}

interface VisitRecord {
  id: string;
  visit_date: string;
  visit_plan_id: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialty: string;
  };
  brick: {
    name: string;
  };
}

const VisitReport: React.FC<VisitReportProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch visit records for the current delegate
  const { data: visitRecords, isLoading } = useQuery({
    queryKey: ['visit-records', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_date,
          visit_plan_id,
          visit_plans!inner(
            doctor_id,
            doctors!inner(
              first_name,
              last_name,
              specialty,
              brick_id,
              bricks!inner(
                name
              )
            )
          )
        `)
        .eq('visit_plans.delegate_id', profile.id)
        .order('visit_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      return data.map((visit: any) => ({
        id: visit.id,
        visit_date: visit.visit_date,
        visit_plan_id: visit.visit_plan_id,
        doctor: {
          first_name: visit.visit_plans.doctors.first_name,
          last_name: visit.visit_plans.doctors.last_name,
          specialty: visit.visit_plans.doctors.specialty || 'Not specified',
        },
        brick: {
          name: visit.visit_plans.doctors.bricks.name,
        },
      })) as VisitRecord[];
    },
    enabled: !!profile?.id,
  });

  // Get visits for the selected date
  const selectedDateVisits = visitRecords?.filter(visit => 
    selectedDate && isSameDay(parseISO(visit.visit_date), selectedDate)
  ) || [];

  // Get dates that have visits for calendar highlighting
  const visitDates = visitRecords?.map(visit => parseISO(visit.visit_date)) || [];

  // Generate time slots with 30-minute intervals
  const generateTimeSlots = (visits: VisitRecord[]) => {
    const timeSlots = [];
    const startHour = 8; // 8:00 AM
    const endHour = 18; // 6:00 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Find visit for this time slot
        const visit = visits.find(v => {
          const visitTime = format(parseISO(v.visit_date), 'HH:mm');
          return visitTime === timeString;
        });
        
        timeSlots.push({
          time: timeString,
          visit: visit || null,
        });
      }
    }
    
    return timeSlots;
  };

  const timeSlots = generateTimeSlots(selectedDateVisits);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Visit Report</h1>
                  <p className="text-sm text-gray-600">
                    Calendar view of your visit records
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Visit Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  hasVisit: visitDates,
                }}
                modifiersStyles={{
                  hasVisit: {
                    backgroundColor: 'rgb(20 184 166)',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }}
              />
              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-4 h-4 bg-teal-500 rounded"></div>
                <span>Days with visits</span>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading visit records...</div>
                </div>
              ) : selectedDateVisits.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-3 rounded-lg border transition-all ${
                        slot.visit
                          ? 'bg-teal-50 border-teal-200 shadow-sm'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="w-16 text-sm font-mono text-gray-600">
                        {slot.time}
                      </div>
                      <div className="flex-1 ml-4">
                        {slot.visit ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-teal-600" />
                              <span className="font-medium text-gray-900">
                                Dr. {slot.visit.doctor.first_name} {slot.visit.doctor.last_name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Specialty: {slot.visit.doctor.specialty}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>Brick: {slot.visit.brick.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            No visit scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    No visits recorded for {format(selectedDate, 'MMMM d, yyyy')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    Select a date to view visit details
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Visit Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {visitRecords?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Visits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(visitRecords?.map(v => v.doctor.first_name + ' ' + v.doctor.last_name)).size || 0}
                </div>
                <div className="text-sm text-gray-600">Unique Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {new Set(visitRecords?.map(v => v.brick.name)).size || 0}
                </div>
                <div className="text-sm text-gray-600">Different Bricks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitReport;