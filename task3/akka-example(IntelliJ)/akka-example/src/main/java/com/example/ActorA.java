package com.example;

import akka.actor.AbstractActor;
import akka.actor.ActorRef;
import akka.actor.Props;


public class ActorA extends AbstractActor {

    public static Props props() {
        return Props.create(ActorA.class, ActorA::new);
    }

    @Override
    public Receive createReceive() {
        return receiveBuilder()
                .match(MessageA.class, this::onMessageA)
                .match(MessageB.class, this::onMessageB)
                .build();
    }

    private void onMessageA(MessageA msg) {
        System.out.println("Actor A received Message A : "+ msg.text + " from " + getSender());
        if(msg.text.equalsIgnoreCase("Goodbye!")) {
          getContext().getSystem().terminate();
        }
        else {
            ActorRef actorBRef = getContext().getSystem().actorOf(Props.create(ActorB.class));
            actorBRef.tell(new MessageA("Hello!"), getSelf());
        }
        for (int i=0; i<10; i++){
            System.out.println("Actor A doing work "+i);
        }
    }

    private void onMessageB(MessageB msg) {
        System.out.println("Actor A received Message B : "+ msg.number + " from " + getSender());
        getSender().tell(new MessageB(999),getSelf());
        for (int i=0; i<10; i++){
            System.out.println("Actor A doing more work "+i);
        }

    }
}