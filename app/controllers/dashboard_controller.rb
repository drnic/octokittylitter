class DashboardController < ApplicationController
  layout "main"
  before_filter :require_user
end
