package Assignments;

import akka.actor.AbstractActor;
import akka.actor.Props;


public class BankAccount extends AbstractActor {// BankAccount actor + extends Akka's AbstractActor
    private int balance = 100;//  the account balance, initialized to 100


    public BankAccount() {// Constructor for the BankAccount actor

        System.out.println("Initial account balance: £" + balance);//account balance to the console
    }

    public static Props props() {//create Props for the BankAccount actor
        return Props.create(BankAccount.class, BankAccount::new);//Returns a Props instance that can be used to create a BankAccount actor

    }

    @Override
    public Receive createReceive() {
        return receiveBuilder()
                .match(DepositClass.class, this::handleDeposit)// if depositclass received msg then handelig deposit
                .match(WithdrawClass.class, this::handleWithdrawal)// if Withdrawalclass received msg then handelig Withdrawal
                .build();//Build the receive behavior
    }

    private void handleDeposit(DepositClass deposit) {// handele deposit msg
        balance += deposit.Value1;// add val from deposit to balance

        System.out.println("Deposited £" + deposit.Value1 + ", new balance: £" + balance);//deposited amount and new balance to the console
    }

    private void handleWithdrawal(WithdrawClass withdrawal) {// handeling withdrawal msg
        if (balance >= withdrawal.Value1) {// Patikrinkrina, ar likutis yra pakankamas pastaba: kadangi atsiėmimas.1 vertė yra neigiama, ši sąlyga visada gali būti teisinga teigiamam likučiui
            balance -= withdrawal.Value1;// atema is sumos
            System.out.println("Withdrew £" + Math.abs(withdrawal.Value1) + ", new balance: £" + balance);//Withdrew amount and new balance
              //  if the withdrawal is -£100, Math.abs(-100) returns 100, making the output "Withdrew £100" instead of "Withdrew £-100."
        }
    }

}

