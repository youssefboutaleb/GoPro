import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LineChart, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SalesForecastingProps {
  onBack: () => void;
}

const SalesForecasting: React.FC<SalesForecastingProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Mock data for demonstration
  const forecastData = {
    month: {
      predicted: 125000,
      confidence: 87,
      trend: '+12%',
      comparison: 'vs last month'
    },
    quarter: {
      predicted: 380000,
      confidence: 82,
      trend: '+15%',
      comparison: 'vs last quarter'
    },
    year: {
      predicted: 1500000,
      confidence: 75,
      trend: '+18%',
      comparison: 'vs last year'
    }
  };

  const currentForecast = forecastData[selectedPeriod];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <LineChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-700">Sales Forecasting</h1>
                <p className="text-sm text-blue-600 italic font-semibold">
                  Predict. Plan. Perform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Period Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Période de Prévision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('month')}
                className={selectedPeriod === 'month' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : ''}
              >
                Mois
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('quarter')}
                className={selectedPeriod === 'quarter' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : ''}
              >
                Trimestre
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('year')}
                className={selectedPeriod === 'year' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : ''}
              >
                Année
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Predicted Sales */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Ventes Prévues</CardTitle>
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {currentForecast.predicted.toLocaleString('fr-FR')} €
              </div>
              <p className="text-sm text-gray-600">
                pour le {selectedPeriod === 'month' ? 'mois' : selectedPeriod === 'quarter' ? 'trimestre' : 'année'} prochain
              </p>
            </CardContent>
          </Card>

          {/* Confidence Level */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-green-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Niveau de Confiance</CardTitle>
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 mb-2">
                {currentForecast.confidence}%
              </div>
              <p className="text-sm text-gray-600">
                Fiabilité de la prévision IA
              </p>
            </CardContent>
          </Card>

          {/* Trend */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Tendance</CardTitle>
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 mb-2">
                {currentForecast.trend}
              </div>
              <p className="text-sm text-gray-600">
                {currentForecast.comparison}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-lg text-gray-700">Analyse IA et Recommandations</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-blue-700">Tendance Positive:</span> Les données historiques montrent une croissance constante. 
                Votre performance dépasse les objectifs de {currentForecast.trend.replace('+', '')} sur la période sélectionnée.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-green-700">Opportunités:</span> Les produits cardiovasculaires montrent un fort potentiel. 
                Concentrez vos efforts sur ce segment pour maximiser les résultats.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-yellow-700">Points d'Attention:</span> La saisonnalité peut impacter les ventes. 
                Adaptez votre stratégie en conséquence pour maintenir la trajectoire.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fonctionnalité en Développement
              </h3>
              <p className="text-gray-600 mb-4">
                Les prévisions avancées avec graphiques interactifs et analyses détaillées seront bientôt disponibles.
              </p>
              <p className="text-sm text-blue-600 font-semibold">
                Restez connecté pour plus de fonctionnalités IA !
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesForecasting;
