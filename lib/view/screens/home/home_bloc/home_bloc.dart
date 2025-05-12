import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:golden_owl/data/constaints/constaints.dart';
import 'package:golden_owl/data/model/weather_model.dart';

import '../../../../core/local_storage/service_weather_preference.dart';
import '../../../../core/service/location_service/location_service_factory.dart';
import '../../../../data/model/search_city_result.dart';
import '../../../../data/repositories/home_repository.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final homeRepository = HomeRepository();

  HomeBloc() : super(HomeInitialState()) {
    on<SearchCityEvent>(_searchCity);
    on<LoadMoreForecastEvent>(_loadMoreForecast);
    on<RequireCurrentLocationEvent>(_loadCurrentWeather);
  }

  void _searchCity(SearchCityEvent event, Emitter<HomeState> emit) async {
    emit(HomeLoadingState());
    try {
      // Step 1: Get accurate city information from API (e.g., "hano" -> "Hanoi")
      final SearchCityResult result = await homeRepository.getSearchCityName(event.cityName);
      final String standardizedCityName = result.name; // exact name from API, e.g., "Hanoi"

      // Step 2: Check if there's a cache for this city
      final WeatherResponse? weatherResponseCached = await serviceWeatherPreferences.getCachedWeatherResponse(standardizedCityName);
      final bool isCached = weatherResponseCached != null;

      if (isCached) {
        // Ensure CurrentWeather has the standardized city name
        final CurrentWeather updatedCurrentWeather = CurrentWeather(
          cityName: standardizedCityName,
          temperature: weatherResponseCached.currentWeather.temperature,
          windSpeed: weatherResponseCached.currentWeather.windSpeed,
          humidity: weatherResponseCached.currentWeather.humidity,
          iconUrl: weatherResponseCached.currentWeather.iconUrl,
          iconText: weatherResponseCached.currentWeather.iconText,
          date: weatherResponseCached.currentWeather.date,
        );

        emit(
          HomeLoadedState(
            currentWeather: updatedCurrentWeather,
            listForecastWeather: weatherResponseCached.forecastWeather,
          ),
        );
      } else {
        // Step 3: If no cache, fetch from API and save with standardized city name
        final weatherResponseFetch = await homeRepository.getCurrentAndForecastsWeather(standardizedCityName);

        // Ensure CurrentWeather has the standardized city name
        final CurrentWeather updatedCurrentWeather = CurrentWeather(
          cityName: standardizedCityName,
          temperature: weatherResponseFetch.currentWeather.temperature,
          windSpeed: weatherResponseFetch.currentWeather.windSpeed,
          humidity: weatherResponseFetch.currentWeather.humidity,
          iconUrl: weatherResponseFetch.currentWeather.iconUrl,
          iconText: weatherResponseFetch.currentWeather.iconText,
          date: weatherResponseFetch.currentWeather.date,
        );

        final updatedWeatherResponse = WeatherResponse(
          currentWeather: updatedCurrentWeather,
          forecastWeather: weatherResponseFetch.forecastWeather,
        );

        emit(
          HomeLoadedState(
            currentWeather: updatedCurrentWeather,
            listForecastWeather: weatherResponseFetch.forecastWeather,
          ),
        );
        await serviceWeatherPreferences.saveSearchedWeather(standardizedCityName, updatedWeatherResponse);
      }
    } catch (e) {
      String errorMessage = e.toString();

      // Handle different types of errors with specific messages
      if (errorMessage.contains('Network error')) {
        // Network connectivity issues
        emit(HomeErrorState(
            errorMessage: 'Network connection error. Please check your internet connection and try again.',
            errorType: NETWORK_ERROR_TYPE
        ));
      } else if (errorMessage.contains('City not found')) {
        // City not found error
        emit(HomeErrorState(
            errorMessage: 'City not found. Please try a different location.',
            errorType: CITY_NOT_FOUND_ERROR_TYPE
        ));
      } else {
        // Generic error
        emit(HomeErrorState(
            errorMessage: 'Failed to search weather data: $errorMessage',
            errorType: GENERAL_ERROR_TYPE
        ));
      }
    }
  }


  void _loadMoreForecast(LoadMoreForecastEvent event, Emitter<HomeState> emit) async {
    emit(HomeLoadingMoreState());
    try {
      // Ensure using the correct standardized city name from CurrentWeather
      final standardizedCityName = event.currentWeather.cityName ?? event.cityName;
      
      final forecasts = await homeRepository.getMoreForecastsWeather(standardizedCityName, event.days);
      
      final weatherResponseLoaded = WeatherResponse(currentWeather: event.currentWeather, forecastWeather: forecasts);
      await serviceWeatherPreferences.saveLoadMoreForecastWeather(standardizedCityName, weatherResponseLoaded);
      
      emit(HomeLoadedMoreState(forecastWeather: forecasts));
    } catch (e) {
      String errorMessage = e.toString();

      // Handle different types of errors with specific messages
      if (errorMessage.contains('Network error')) {
        // Network connectivity issues
        emit(HomeErrorMoreState(
          errorMessage: 'Network connection error. Please check your internet connection and try again.',
          errorType: NETWORK_ERROR_TYPE
        ));
      } else if (errorMessage.contains('City not found')) {
        // City not found error
        emit(HomeErrorMoreState(
          errorMessage: 'City not found. Please try a different location.',
          errorType: CITY_NOT_FOUND_ERROR_TYPE
        ));
      } else {
        // Generic error
        emit(HomeErrorMoreState(
          errorMessage: 'Failed to load more forecast data: $errorMessage',
          errorType: GENERAL_ERROR_TYPE
        ));
      }
    }
  }

  void _loadCurrentWeather(RequireCurrentLocationEvent event, Emitter<HomeState> emit) async {
    emit(HomeLoadingState());
    
    try {
      final locationService = LocationServiceFactory.getLocationService();
      final coordinates = await locationService.getCurrentLocation();
      
      if (coordinates != null && coordinates.length == 2) {
        final lat = coordinates[0];
        final lng = coordinates[1];
        
        // You could implement weather fetching by coordinates here
        // For now, we'll just use a city name search for the demo
        try {
          final weatherResponseFetch = await homeRepository.getCurrentAndForecastsUseGPSWeather(lat, lng);

          final CurrentWeather updatedCurrentWeather = CurrentWeather(
            cityName: "Current Location (${lat.toStringAsFixed(2)}, ${lng.toStringAsFixed(2)})",
            temperature: weatherResponseFetch.currentWeather.temperature,
            windSpeed: weatherResponseFetch.currentWeather.windSpeed,
            humidity: weatherResponseFetch.currentWeather.humidity,
            iconUrl: weatherResponseFetch.currentWeather.iconUrl,
            iconText: weatherResponseFetch.currentWeather.iconText,
            date: weatherResponseFetch.currentWeather.date,
          );
          
          final updatedWeatherResponse = WeatherResponse(
            currentWeather: updatedCurrentWeather,
            forecastWeather: weatherResponseFetch.forecastWeather,
          );
          emit(HomeLoadedState(currentWeather: updatedCurrentWeather, listForecastWeather: weatherResponseFetch.forecastWeather));
        } catch (e) {
          emit(HomeErrorState(errorType: GENERAL_ERROR_TYPE,errorMessage: 'Failed to fetch weather for your location: ${e.toString()}'));
        }
      } else {
        emit(HomeRequireCurrentLocationErrorState());
      }
    } catch (e) {
      String errorMessage;
      
      // Provide more user-friendly error messages
      if (e.toString().contains('PERMISSION_DENIED') || 
          e.toString().contains('permission denied') ||
          e.toString().contains('denied')) {
        errorMessage = 'Location permission denied. Please allow the app to access your location in settings.';
      } else if (e.toString().contains('POSITION_UNAVAILABLE') || 
                e.toString().contains('unavailable')) {
        errorMessage = 'Location information is unavailable. Please try again later.';
      } else if (e.toString().contains('TIMEOUT') || 
                e.toString().contains('timed out')) {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (e.toString().contains('disabled') || 
                e.toString().contains('turned off') ||
                e.toString().contains('services are not enabled')) {
        errorMessage = 'Location services are disabled. Please enable location services in settings.';
      } else {
        errorMessage = 'Failed to get your current location: ${e.toString()}';
      }
      
      emit(HomeErrorState(errorType: GENERAL_ERROR_TYPE,errorMessage: errorMessage));
    }
  }
}
