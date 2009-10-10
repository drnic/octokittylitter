class InboxController < ApplicationController
  def index
    @messages = Message.inbox
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
    @messages = Message.sent_mailbox
  end

end
