<picture><source srcset="img/1.png"><img></picture>

# Removing an Unwanted Merge Commit from Main

> **⚠️ WARNING:** This will rewrite history! All commits after the merge will get new hashes. Collaborators must rebase or reset their work.

---

## 0. Safety First: Check for Local Changes

```sh
git status
```

---

## 1. Get Up to Date

```sh
git fetch origin --prune
```
```
git checkout main
```
```
git pull --ff-only origin main
```

---

## 2. Backup Before Rewriting History (Recommended)

Create a backup branch and tag so you can recover if needed.

```sh
git branch backup/pre-merge-7f1dacd
```
```
git tag backup-pre-merge-7f1dacd
```

---

## 3. Drop the Merge Commit by Rebasing

Rebase all commits after the merge onto its first parent, pretending the merge never happened.  
Replace `7f1dacd` with your actual merge commit hash.

```sh
git rebase --rebase-merges --onto 7f1dacd^ 7f1dacd main
```

**Windows CMD Note:**  
To pass a caret (`^`) in Windows CMD, double it:  
```sh
git rebase --rebase-merges --onto 7f1dacd^^ 7f1dacd main
```

---

## 4. Force-Push the Rewritten History

```sh
git push --force-with-lease origin main
```

---

## Recovery

If you hit conflicts you don’t want to resolve, or want to abort:

- **Abort the rebase:**  
  ```sh
  git rebase --abort
  ```

- **Restore the backup:**  
  ```sh
  git checkout main
  ```
  ```
  git reset --hard backup/pre-merge-7f1dacd
  ```

---

## Cleanup (Optional)

Delete your backup branch and tag (both local and remote):

**Delete local branch:**
```sh
git branch -d backup/pre-merge-7f1dacd
```

**Delete remote branch:**
```sh
git push origin --delete backup/pre-merge-7f1dacd
```

**Delete local tag:**
```sh
git tag -d backup-pre-merge-7f1dacd
```

**Delete remote tag:**
```sh
git push origin :refs/tags/backup-pre-merge-7f1dacd
```

---

## Notes

- `7f1dacd` is the merge commit you want to remove.
- `7f1dacd^` is the first parent (the mainline commit before the merge).
- This process rewrites history — **coordinate with your team**.
