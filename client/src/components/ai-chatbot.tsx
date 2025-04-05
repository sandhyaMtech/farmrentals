import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, User, Bot, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatbotProps {
  language: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatbot({ language, isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Mock AI response for demo
  const mockResponses = {
    en: {
      greetings: [
        "Hello! How can I help you with Village Wheels today?",
        "Welcome to Village Wheels support! What can I assist you with?",
        "Hi there! I'm here to help with your farming equipment needs."
      ],
      booking: [
        "Booking is simple! Browse available equipment, select dates, and submit your request. The owner will confirm soon.",
        "To book equipment, go to the Browse page, find what you need, and click Book. Then select your dates and purpose."
      ],
      payments: [
        "Currently we accept cash payments upon equipment delivery. We'll add online payments soon!",
        "Payment is done in cash when the equipment is delivered or when you pick it up from the owner."
      ],
      cancel: [
        "You can cancel a booking from your Bookings page. Look for the booking and click the Cancel button.",
        "To cancel, go to Bookings, find your reservation, and click Cancel. No fees for cancellations made 24 hours in advance."
      ],
      equipment: [
        "Village Wheels has tractors, harvesters, sprayers, ploughs, seeders and other farming equipment.",
        "You can find various equipment like tractors, harvesters, and other farming tools on our platform."
      ],
      complaints: [
        "I've recorded your complaint. Our team will review it and reach out within 24 hours.",
        "Your complaint has been submitted. We take all feedback seriously and will investigate promptly."
      ],
      fallback: [
        "I don't have that information right now. Please contact our support team at support@villagewheels.com for further assistance.",
        "I'm not sure about that. For specific help, please email our support team at support@villagewheels.com."
      ]
    },
    ta: {
      greetings: [
        "வணக்கம்! இன்று Village Wheels-இல் நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
        "Village Wheels ஆதரவுக்கு வரவேற்கிறோம்! நான் உங்களுக்கு எதில் உதவ முடியும்?",
        "வணக்கம்! உங்கள் விவசாய உபகரணத் தேவைகளுக்கு உதவ நான் இங்கே இருக்கிறேன்."
      ],
      booking: [
        "முன்பதிவு செய்வது எளிது! கிடைக்கக்கூடிய உபகரணங்களைப் பார்வையிடவும், தேதிகளைத் தேர்ந்தெடுக்கவும், மற்றும் உங்கள் கோரிக்கையைச் சமர்ப்பிக்கவும். உரிமையாளர் விரைவில் உறுதிப்படுத்துவார்.",
        "உபகரணத்தை முன்பதிவு செய்ய, பார்வையிடு பக்கத்திற்குச் சென்று, உங்களுக்குத் தேவையானதைக் கண்டறிந்து, முன்பதிவு என்பதைக் கிளிக் செய்யவும். பின்னர் உங்கள் தேதிகள் மற்றும் நோக்கத்தைத் தேர்ந்தெடுக்கவும்."
      ],
      payments: [
        "தற்போது உபகரணம் வழங்கப்படும் போது பணம் செலுத்துதலை ஏற்றுக்கொள்கிறோம். விரைவில் ஆன்லைன் கட்டணங்களைச் சேர்ப்போம்!",
        "உபகரணம் வழங்கப்படும்போது அல்லது நீங்கள் உரிமையாளரிடமிருந்து எடுக்கும்போது பணம் செலுத்தப்படுகிறது."
      ],
      cancel: [
        "உங்கள் முன்பதிவுகள் பக்கத்திலிருந்து முன்பதிவை ரத்து செய்யலாம். முன்பதிவைக் கண்டுபிடித்து ரத்து செய் பொத்தானைக் கிளிக் செய்யவும்.",
        "ரத்து செய்ய, முன்பதிவுகள் என்பதற்குச் சென்று, உங்கள் முன்பதிவைக் கண்டறிந்து, ரத்து செய் என்பதைக் கிளிக் செய்யவும். 24 மணி நேரத்திற்கு முன்னதாக ரத்து செய்தால் கட்டணங்கள் இல்லை."
      ],
      equipment: [
        "Village Wheels-இல் டிராக்டர்கள், அறுவடை இயந்திரங்கள், தெளிப்பான்கள், கலப்பைகள், விதைப்பான்கள் மற்றும் பிற விவசாய உபகரணங்கள் உள்ளன.",
        "எங்கள் தளத்தில் டிராக்டர்கள், அறுவடை இயந்திரங்கள் மற்றும் பிற விவசாயக் கருவிகள் போன்ற பல்வேறு உபகரணங்களைக் காணலாம்."
      ],
      complaints: [
        "உங்கள் புகாரை நான் பதிவு செய்துள்ளேன். எங்கள் குழு அதை மதிப்பாய்வு செய்து 24 மணி நேரத்திற்குள் தொடர்பு கொள்ளும்.",
        "உங்கள் புகார் சமர்ப்பிக்கப்பட்டுள்ளது. நாங்கள் அனைத்து கருத்துக்களையும் தீவிரமாக எடுத்துக்கொண்டு விரைவில் விசாரிப்போம்."
      ],
      fallback: [
        "எனக்கு இப்போது அந்தத் தகவல் இல்லை. மேலும் உதவிக்கு எங்கள் ஆதரவுக் குழுவைத் support@villagewheels.com இல் தொடர்பு கொள்ளவும்.",
        "எனக்கு அதைப் பற்றி உறுதியாகத் தெரியவில்லை. குறிப்பிட்ட உதவிக்கு, support@villagewheels.com இல் எங்கள் ஆதரவுக் குழுவிற்கு மின்னஞ்சல் அனுப்பவும்."
      ]
    }
  };
  
  // Generate initial greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add initial greeting from AI
      const greetings = language === 'en' ? mockResponses.en.greetings : mockResponses.ta.greetings;
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setMessages([
        {
          id: Date.now().toString(),
          content: randomGreeting,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, language, messages.length]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine which response category to use based on user input
  const getCategoryFromInput = (input: string): keyof typeof mockResponses.en => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('book') || lowerInput.includes('reservation') || 
        lowerInput.includes('reserve') || lowerInput.includes('முன்பதிவு')) {
      return 'booking';
    } else if (lowerInput.includes('pay') || lowerInput.includes('cost') || 
               lowerInput.includes('price') || lowerInput.includes('பணம்') || 
               lowerInput.includes('செலுத்து')) {
      return 'payments';
    } else if (lowerInput.includes('cancel') || lowerInput.includes('ரத்து')) {
      return 'cancel';
    } else if (lowerInput.includes('equipment') || lowerInput.includes('machine') || 
               lowerInput.includes('tool') || lowerInput.includes('உபகரணம்')) {
      return 'equipment';
    } else if (lowerInput.includes('complaint') || lowerInput.includes('issue') || 
               lowerInput.includes('problem') || lowerInput.includes('பிரச்சனை') || 
               lowerInput.includes('புகார்')) {
      return 'complaints';
    } else if (lowerInput.includes('hi') || lowerInput.includes('hello') || 
               lowerInput.includes('வணக்கம்')) {
      return 'greetings';
    } else {
      return 'fallback';
    }
  };
  
  // Mock AI chat mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine response category from message
      const category = getCategoryFromInput(userMessage);
      
      // Get appropriate responses
      const responses = language === 'en' ? mockResponses.en[category] : mockResponses.ta[category];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return { response: randomResponse };
    },
    onSuccess: (data) => {
      // Add AI response to chat
      setMessages((prevMessages) => [
        ...prevMessages, 
        {
          id: Date.now().toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    },
    onError: (error) => {
      toast({
        title: language === 'en' ? 'Error communicating with assistant' : 'உதவியாளருடன் தொடர்பு கொள்வதில் பிழை',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Send to AI and get response
    chatMutation.mutate(inputValue);
    
    // Clear input
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Translations
  const translations = {
    en: {
      title: 'Village Wheels Assistant',
      subtitle: 'Ask questions or report issues',
      placeholder: 'Type your message...',
      send: 'Send',
      close: 'Close',
      today: 'Today',
      yesterday: 'Yesterday',
      typing: 'Assistant is typing...'
    },
    ta: {
      title: 'Village Wheels உதவியாளர்',
      subtitle: 'கேள்விகளைக் கேளுங்கள் அல்லது சிக்கல்களைப் புகாரளிக்கவும்',
      placeholder: 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...',
      send: 'அனுப்பு',
      close: 'மூடு',
      today: 'இன்று',
      yesterday: 'நேற்று',
      typing: 'உதவியாளர் தட்டச்சு செய்கிறார்...'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  // Format timestamp
  const formatMessageTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>{t.title}</SheetTitle>
          <SheetDescription>{t.subtitle}</SheetDescription>
        </SheetHeader>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.role === 'user'
                    ? 'flex-row-reverse'
                    : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                  <Avatar>
                    {message.role === 'user' ? (
                      <AvatarFallback>U</AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Show typing indicator while loading */}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex-shrink-0 mr-2">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="px-4 py-2 rounded-lg bg-muted">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.typing}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || chatMutation.isPending}
              size="icon"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}