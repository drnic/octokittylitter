class UsersController < ApplicationController
  layout "public"
  resource_controller
  
  def create
    @user = User.new(params[:user])
    if @user.save
      redirect_to(inbox_index_path)
    else
      render :action => "new"
    end
  end
end
