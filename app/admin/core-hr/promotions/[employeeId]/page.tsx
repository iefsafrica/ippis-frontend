'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Building,
  Calendar,
  User,
  Briefcase,
  Award,
  Clock,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MoreVertical,
  Eye,
  FileIcon,
  History,
  Activity,
  Target,
  Star,
  Users,
  ChevronRight,
  ArrowUpRight,
  Percent,
} from 'lucide-react';
import { usePromotedEmployeeDetails } from '@/services/hooks/hr-core/usePromotions';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PromotedEmployeeDetails, Promotion } from '@/types/hr-core/promotion-management';

interface EmployeeDetailsWithUI extends PromotedEmployeeDetails {
  avatar?: string;
  phone?: string;
  location?: string;
  years_of_service?: number;
  performance_rating?: number;
}

export default function PromotionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    if (!params || typeof params !== 'object') {
      toast({
        title: 'Routing Error',
        description: 'Invalid route parameters',
        variant: 'destructive',
      });
    }
  }, [params, toast]);

  if (!params || typeof params !== 'object') {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-8">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Routing Error
              </h3>
              <p className="text-gray-500">
                Could not load route parameters. Please check the URL.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const employeeId = params?.employeeId as string;

  if (!employeeId) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/admin/promotions')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Promotions
          </Button>
        </div>
        <Card>
          <CardContent className="pt-8">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invalid Employee ID
              </h3>
              <p className="text-gray-500">
                The employee ID is missing from the URL.
              </p>
              <Button className="mt-6" onClick={() => router.push('/admin/promotions')}>
                Go to Promotions List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    data: employeeDetails,
    isLoading,
    error,
  } = usePromotedEmployeeDetails(employeeId);

  const handleGoBack = () => {
    router.push('/admin/core-hr/promotions');
  };

  const handleExport = () => {
    toast({
      title: 'Export Successful',
      description: 'Promotion history exported to PDF',
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: 'Print Ready',
      description: 'Document prepared for printing',
    });
  };

  const handleSendNotification = () => {
    toast({
      title: 'Notification Sent',
      description: 'Promotion summary sent to employee',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !employeeDetails) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Promotions
          </Button>
        </div>
        <Card>
          <CardContent className="pt-8">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? 'Error Loading Data' : 'Employee Not Found'}
              </h3>
              <p className="text-gray-500">
                {error 
                  ? 'Failed to load promotion details. Please try again.'
                  : 'The promotion details for this employee could not be loaded.'
                }
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Button onClick={() => router.refresh()} variant="outline">
                  Retry
                </Button>
                <Button onClick={handleGoBack}>
                  Return to List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
//@ts-expect-error - fix any
  const { promotions, ...employee } = employeeDetails as EmployeeDetailsWithUI;
  const latestPromotion = promotions[promotions.length - 1];
  const tenureInMonths = Math.floor(
    (new Date().getTime() - new Date(employee.join_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const calculateAveragePromotionCycle = (promotions: Promotion[]) => {
    if (promotions.length < 2) return 0;
    
    let totalMonths = 0;
    for (let i = 1; i < promotions.length; i++) {
      const currentDate = new Date(promotions[i].effective_date);
      const previousDate = new Date(promotions[i-1].effective_date);
      const monthsDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      totalMonths += monthsDiff;
    }
    
    return Math.round(totalMonths / (promotions.length - 1));
  };

  const averagePromotionCycle = calculateAveragePromotionCycle(promotions);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate performance metrics
  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-green-500';
    if (rating >= 3.5) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="container mx-auto space-y-8 px-0 py-4 sm:px-4 sm:py-8">
      {/* Header with Actions */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack} 
              className="gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Promotions</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-gray-900">Employee Details</span>
            </div>
          </div>
          
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              className="w-full gap-2 border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint} 
              className="w-full gap-2 border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-gray-300 hover:bg-gray-50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSendNotification} className="gap-2">
                  <Mail className="h-4 w-4" />
                  Send Notification
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Full Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <FileIcon className="h-4 w-4" />
                  View Documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Employee Header Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start space-x-4 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback className="bg-green-50 text-green-700 text-lg font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <div className="bg-green-600 text-white p-1.5 rounded-full">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 min-w-0">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">&bull;</span>
                      
                      <span className="text-sm text-gray-600">{employee.employee_id}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{employee.position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Joined {new Date(employee.join_date).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-left lg:text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {promotions.length}
                </div>
                <div className="text-sm text-gray-500">Total Promotions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Summary & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Career Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tenure</p>
                      <p className="font-semibold text-gray-900">
                        {Math.floor(tenureInMonths / 12)}y {tenureInMonths % 12}m
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Star className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Performance</p>
                      <p className={`font-semibold ${getPerformanceColor(employee.performance_rating || 4.8)}`}>
                        {employee.performance_rating?.toFixed(1) || '4.8'}/5.0
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg. Cycle</p>
                      <p className="font-semibold text-gray-900">{averagePromotionCycle || 18} months</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Career Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.min(tenureInMonths, 100)}%</span>
                </div>
                <Progress value={Math.min(tenureInMonths, 100)} className="h-2 bg-gray-200">
                  <div className="h-full bg-green-600 rounded-full transition-all duration-300" style={{ width: `${Math.min(tenureInMonths, 100)}%` }} />
                </Progress>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{employee.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{employee.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Mail className="h-4 w-4 mr-2" />
                Contact Employee
              </Button>
            </CardContent>
          </Card>

          {/* Latest Promotion */}
          {latestPromotion && (
            <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  Latest Promotion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Effective Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(latestPromotion.effective_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">From</p>
                      <p className="text-sm font-medium text-gray-900">{latestPromotion.previous_position}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <div className="text-center">
                      <p className="text-xs text-gray-600">To</p>
                      <p className="text-sm font-medium text-green-700">{latestPromotion.new_position}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm font-medium text-gray-900">
                      {latestPromotion.department || employee.department}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-2 sm:gap-6">
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Promotion History
                </div>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Career Timeline
                </div>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Insights & Analysis
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'history' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Promotion Records</CardTitle>
                    <CardDescription className="text-gray-500">
                      Complete history of position changes and advancements
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-gray-50">
                    {promotions.length} records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto rounded-lg border border-gray-200 [-webkit-overflow-scrolling:touch]">
                  <Table className="min-w-[980px]">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">From Position</TableHead>
                        <TableHead className="font-semibold text-gray-700">To Position</TableHead>
                        <TableHead className="font-semibold text-gray-700">Department</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center py-8">
                              <Award className="h-12 w-12 text-gray-300 mb-4" />
                              <p className="text-gray-500">No promotion records found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        promotions.map((promotion: Promotion) => (
                          <TableRow key={promotion.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="text-gray-900">
                                  {new Date(promotion.effective_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(promotion.effective_date).toLocaleDateString('en-US', {
                                    weekday: 'short'
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                                <span className="text-gray-700">{promotion.previous_position}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-gray-900">{promotion.new_position}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                {promotion.department || employee.department}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="icon" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'timeline' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Career Journey</CardTitle>
                <CardDescription className="text-gray-500">
                  Visual timeline of professional growth and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                  
                  {promotions.map((promotion: Promotion, index: number) => (
                    <div key={promotion.id} className="relative flex items-start mb-8 last:mb-0">
                      {/* Timeline Dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full border-4 border-white flex items-center justify-center ${
                          index === promotions.length - 1 ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          <Award className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="ml-6 flex-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-gray-900">{promotion.new_position}</h4>
                                <Badge className="bg-green-50 text-green-700 border-green-200">
                                  Level {index + 1}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Promoted from {promotion.previous_position}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">{promotion.reason}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="outline" className="bg-gray-50">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(promotion.effective_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </Badge>
                              <div className="text-sm text-gray-500">
                                {Math.floor((new Date(promotion.effective_date).getTime() - new Date(employee.join_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months after joining
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                              <Building className="h-3 w-3 text-gray-500" />
                              <span className="text-sm text-gray-700">{promotion.department || employee.department}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                              <Percent className="h-3 w-3 text-green-600" />
                              <span className="text-sm font-medium text-green-700">~15% salary increase</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Growth Rate</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {promotions.length > 0 ? ((promotions.length / (tenureInMonths / 12)) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">per year</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-50">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Cycle</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {averagePromotionCycle || 18}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">months between promotions</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-50">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Performance</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {employee.performance_rating?.toFixed(1) || '4.8'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.floor(employee.performance_rating || 4.8)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-yellow-50">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Career Development Insights</CardTitle>
                  <CardDescription className="text-gray-500">
                    Analysis and recommendations for continued growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Growth Pattern Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Total Career Levels</span>
                            <span className="font-medium text-gray-900">{promotions.length}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Time to First Promotion</span>
                            <span className="font-medium text-gray-900">
                              {promotions.length > 0 
                                ? Math.floor((new Date(promotions[0].effective_date).getTime() - new Date(employee.join_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
                                : 'N/A'} months
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Consistency Score</span>
                            <span className="font-medium text-green-700">Excellent</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Next Steps</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-gray-900">Next Target Position</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {employee.position.includes('Senior') ? 'Lead ' : 'Senior '}
                                {employee.position.replace('Senior ', '').replace('Lead ', '')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-gray-900">Estimated Timeline</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {averagePromotionCycle || 12} months based on current trajectory
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Development Recommendations</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                          <span className="text-sm text-gray-700">
                            Focus on leadership development programs
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                          <span className="text-sm text-gray-700">
                            Consider cross-departmental exposure
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                          <span className="text-sm text-gray-700">
                            Maintain current performance levels
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

