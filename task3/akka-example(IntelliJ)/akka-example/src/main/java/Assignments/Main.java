package Assignments;
import akka.actor.typed.Behavior;
import akka.actor.typed.javadsl.AbstractBehavior;
import akka.actor.typed.javadsl.ActorContext;
import akka.actor.typed.javadsl.Behaviors;
import akka.actor.typed.javadsl.Receive;
import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import akka.actor.Props;


import java.io.IOException;
import java.util.Random;


public class Main {//run bank imulation
    public static void main(String[] args) {// main method start point of BS
        ActorSystem system = ActorSystem.create("BankAccount");//  actor system named "BankAccount"
        ActorRef bankAccount = system.actorOf(Props.create(BankAccount.class), "BankAccount");// Create an actor of type BankAccount within the system and give it the name "BankAccount"

        //bankAccount.tell(new DepositClass(0), ActorRef.noSender());//Send an initial deposit mesg with a value of 0 to the BankAccount actor

        Random rand = new Random();// create a random objact to generate  prideda random skaiciu prie sumos

        for (int k = 0; k < 10; k++) {//loop 10time
            int randValue = rand.nextInt(2001) - 1000;// duoda randoms skaicius tarp -1000 ir +1000 kad pridetu arba atimtu nuo sumos

            if (randValue > 0) {// jai random zinute  teigiamma create and send a Deposit mesg
                bankAccount.tell(new DepositClass(randValue), ActorRef.noSender());
            } else if (randValue < 0) {// jai random zinute neigiama create and send a Withdrawal mesg
                bankAccount.tell(new WithdrawClass(randValue), ActorRef.noSender());
            } else {  // If the random value is zero, print an error mesg (transaction error)
                System.out.println("Tramsaction error!");
            }


        }
        system.terminate();//Terminate the actor system after BS processing all transactions


    }

}
