class UserSessionsController < ApplicationController
  layout "public"
  resource_controller
  
  create.success.wants { redirect_to(inbox_index_path) }
  create.failure.flash 'Incorrect login or password.'
end
