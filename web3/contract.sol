// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Définition du contrat TodoList
contract TodoList {
    // Structure représentant une tâche avec un identifiant, contenu et état (complété ou non)
    struct Task {
        uint id; // Identifiant unique de la tâche
        string title;
        string content; // Contenu ou description de la tâche
        bool completed; // État de la tâche, vrai si complétée
    }

    // Tableau dynamique stockant toutes les tâches créées
    Task[] public tasks;

    // Mapping associant l'adresse d'un utilisateur à une liste d'identifiants de ses tâches
    mapping(address => uint[]) userTasks;

    // Événement émis lors de la création d'une nouvelle tâche
    event TaskCreated(
        uint id,
        string title,
        string content,
        bool completed
    );

    // Événement émis lorsqu'une tâche change d'état (complétée ou non)
    event TaskCompleted(
        uint id,
        bool completed
    );

    // Fonction pour créer une nouvelle tâche
    function createTask(string memory _content, string memory _title) public {
        // Ajoute la nouvelle tâche à la liste des tâches avec l'identifiant correspondant,
        // le contenu fourni, et l'état initial non complété (false)
        tasks.push(Task(tasks.length, _title, _content, false));
        // Associe la tâche à l'utilisateur (msg.sender) en ajoutant l'ID de la tâche à son mapping
        userTasks[msg.sender].push(tasks.length - 1);
        // Émet l'événement TaskCreated pour notifier la création de la tâche
        emit TaskCreated(tasks.length - 1, _title, _content, false);
    }

    // Fonction pour changer l'état d'une tâche (complétée ou non)
    function toggleCompleted(uint _id) public {
        // Récupère la tâche concernée par son ID et la stocke temporairement
        Task memory _task = tasks[_id];
        // Change l'état de la tâche (completed) à son inverse (true devient false et vice-versa)
        _task.completed = !_task.completed;
        // Met à jour la tâche dans le tableau des tâches avec son nouvel état
        tasks[_id] = _task;
        // Émet l'événement TaskCompleted pour notifier le changement d'état de la tâche
        emit TaskCompleted(_id, _task.completed);
    }
    // Fonction pour effacer une tâche
    function deleteTask(uint _id) public {
        // Fais en sorte d'effectuer l'action seulement si la longueur du tableau est supérieure à la position de la demande.
        require (_id < tasks.length );
        // Efface la tâche à l'index de l'adresse du wallet de celui qui fait la transaction
        delete(userTasks[msg.sender]);
        // Echange le contenu de la case suivante avec celui de la case maintenant vide
        tasks[_id] = tasks[tasks.length-1];
        // Efface complétement la dernière case (idéalement celle qui est vide)
        tasks.pop();
    }

    // Fonction pour obtenir les IDs des tâches associées à l'utilisateur courant
    function getMyTasks() public view returns (uint[] memory) {
        // Retourne la liste des identifiants de tâches de l'utilisateur (msg.sender) depuis le mapping
        return userTasks[msg.sender];
    }

    // Fonction pour obtenir les détails d'une tâche spécifique par son ID
    function getTask(uint _id) public view returns (Task memory) {
        // Retourne la tâche correspondant à l'ID fourni
        return tasks[_id];
    }
}