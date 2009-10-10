class InboxController < ApplicationController
  def index
    @messages = Message.all(:order => "sent_at DESC")
  end

  def show
  end

  def new
  end

  def create
  end

  def create_reply
  end

  def sent
  end

end
