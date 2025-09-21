export function ReviewModal({ campsite, onSubmit, onClose }) {
    const el = document.createElement("div");
    el.className = "modal-backdrop";
    el.innerHTML = `
      <div class="modal">
        <header class="modal-header">
          <h3>Add a review</h3>
        </header>
  
        <form class="modal-body">
          <div class="field">
            <label class="label">Campsite</label>
            <div class="value">${campsite?.name || campsite?.place_id || "Unknown"}</div>
          </div>
  
          <div class="field">
            <label class="label">Rating</label>
            <div class="stars-input" role="radiogroup" aria-label="Choose a rating from 1 to 5">
              ${[1,2,3,4,5].map(n => `
                <label class="star">
                  <input type="radio" name="rating" value="${n}" ${n===5?"checked":""}/>
                  <span aria-hidden="true">★</span>
                </label>
              `).join("")}
            </div>
          </div>
  
          <div class="field">
            <label class="label" for="rv-comment">Comment (optional)</label>
            <textarea id="rv-comment" name="comment" rows="4" placeholder="What was it like?"></textarea>
          </div>
  
          <footer class="modal-footer">
            <button type="button" class="btn ghost close-btn">Cancel</button>
            <button type="submit" class="btn primary submit-btn">Submit</button>
          </footer>
        </form>
      </div>
    `;
  
    const form  = el.querySelector("form");
    const close = () => { el.remove(); onClose?.(); };
  
    el.addEventListener("click", (e) => {
      if (e.target === el) close(); // click backdrop
    });
    el.querySelector(".close-btn").addEventListener("click", close);
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const rating  = Number(fd.get("rating")) || 0;
      const comment = (fd.get("comment") || "").trim();
  
      if (rating < 1 || rating > 5) return alert("Please choose a rating.");
  
      const btn = el.querySelector(".submit-btn");
      btn.disabled = true; btn.textContent = "Submitting…";
      try {
        await onSubmit?.({ rating, comment });
        close();
      } catch (err) {
        alert(err?.message || "Failed to submit review");
      } finally {
        btn.disabled = false; btn.textContent = "Submit";
      }
    });
  
    return el;
  }
  